# GCP Deployment Script for MediCore Application
param(
    [string]$Project = "medicore-497417",
    [string]$Zone = "us-central1-a",
    [string]$InstanceName = "medicore-vm",
    [string]$MachineType = "e2-small"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting MediCore GCP Deployment Script" -ForegroundColor Cyan
Write-Host "Project: $Project, Zone: $Zone, VM: $InstanceName" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Select the GCP Project
Write-Host "[1/6] Setting active GCP project..." -ForegroundColor Green
gcloud config set project $Project

# 2. Try to enable Compute Engine API
Write-Host "[2/6] Enabling Compute Engine API (this may take a few minutes if not already enabled)..." -ForegroundColor Green
gcloud services enable compute.googleapis.com
if ($LASTEXITCODE -ne 0) {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "ERROR: Failed to enable Compute Engine API." -ForegroundColor Red
    Write-Host "Please ensure that a billing account is linked to your GCP project." -ForegroundColor Red
    Write-Host "You can do this at: https://console.cloud.google.com/billing" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    exit 1
}

# 3. Create GCE VM instance if it doesn't exist
Write-Host "[3/6] Checking for existing VM instance..." -ForegroundColor Green
$vmExists = gcloud compute instances list --filter="name=$InstanceName" --format="value(name)"
if ($vmExists -eq $InstanceName) {
    Write-Host "VM instance $InstanceName already exists. Using existing instance." -ForegroundColor Yellow
} else {
    Write-Host "Creating new VM instance: $InstanceName..." -ForegroundColor Green
    gcloud compute instances create $InstanceName `
        --project=$Project `
        --zone=$Zone `
        --machine-type=$MachineType `
        --image-project=ubuntu-os-cloud `
        --image-family=ubuntu-2204-lts `
        --tags=http-server `
        --metadata-from-file=startup-script=.\startup.sh
}

# Create firewall rule for HTTP if not exists
Write-Host "Ensuring HTTP firewall rule allows traffic on port 80..." -ForegroundColor Green
$fwExists = gcloud compute firewall-rules list --filter="name=default-allow-http" --format="value(name)"
if (-not $fwExists) {
    gcloud compute firewall-rules create default-allow-http `
        --project=$Project `
        --allow=tcp:80 `
        --target-tags=http-server `
        --description="Allow HTTP traffic on port 80"
}

# 4. Package the application files (excluding node_modules and target)
Write-Host "[4/6] Packaging application files (excluding node_modules and target)..." -ForegroundColor Green
$TempDir = ".\temp_deploy"
$ZipPath = ".\deploy.zip"

if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

# Create temporary folder structure
New-Item -ItemType Directory -Path "$TempDir\hospital" | Out-Null
New-Item -ItemType Directory -Path "$TempDir\hospital-frontend" | Out-Null

# Use robocopy for robust, fast directory copy with exclusions
Write-Host "Copying backend files..."
robocopy .\hospital\hospital "$TempDir\hospital\hospital" /s /xd target .git /njh /njs | Out-Null
Write-Host "Copying frontend files..."
robocopy .\hospital-frontend\hospital-frontend "$TempDir\hospital-frontend\hospital-frontend" /s /xd node_modules build .git /njh /njs | Out-Null
Write-Host "Copying orchestration files..."
Copy-Item -Path ".\docker-compose.yml" -Destination $TempDir

# Create zip archive
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force
Remove-Item $TempDir -Recurse -Force
Write-Host "Created deployment package: $ZipPath" -ForegroundColor Green

# 5. Upload deployment package to VM
Write-Host "[5/6] Uploading deployment package to VM..." -ForegroundColor Green
# We attempt multiple times in case the SSH service is still starting up on a new VM
$maxRetries = 5
$retryCount = 0
$scpSuccess = $false
while (-not $scpSuccess -and $retryCount -lt $maxRetries) {
    try {
        $retryCount++
        gcloud compute scp $ZipPath "${InstanceName}:~/deploy.zip" --zone=$Zone --project=$Project --quiet
        $scpSuccess = $true
    } catch {
        if ($retryCount -lt $maxRetries) {
            Write-Host "SSH connection failed. VM might still be booting. Retrying in 15 seconds ($retryCount/$maxRetries)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        } else {
            throw $_
        }
    }
}

# Remove local zip file after successful upload
Remove-Item $ZipPath -Force

# 6. Deploy and start containers via SSH
Write-Host "[6/6] Connecting to VM and starting Docker containers..." -ForegroundColor Green
$SSHCommand = @"
sudo apt-get update && sudo apt-get install -y unzip

echo "Checking Docker installation status..."
for i in {1..30}; do
  if command -v docker &> /dev/null && command -v docker compose &> /dev/null; then
    echo "Docker and Docker Compose are installed and running!"
    break
  fi
  echo "Waiting for Docker & Docker Compose to be installed by VM startup script ($i/30)..."
  sleep 10
done

# Extract deploy archive
mkdir -p ~/app
unzip -o ~/deploy.zip -d ~/app
cd ~/app

# Launch services
sudo docker compose down
sudo docker compose up --build -d

echo "=========================================="
echo "Deployment Finished. Current running containers:"
sudo docker compose ps
echo "=========================================="
"@

gcloud compute ssh $InstanceName --zone=$Zone --project=$Project --command="$SSHCommand" --quiet

# Retrieve External IP
$externalIp = gcloud compute instances describe $InstanceName `
    --project=$Project `
    --zone=$Zone `
    --format="value(networkInterfaces[0].accessConfigs[0].natIP)"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MediCore Application Deployed Successfully!" -ForegroundColor Cyan
Write-Host "Access the application at: http://$externalIp" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
