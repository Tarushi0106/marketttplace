# Fix DNS for Neon Database Connection
# Run this script as Administrator

Write-Host "Fixing DNS settings to allow Neon database connection..." -ForegroundColor Yellow

# Get network adapters
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

foreach ($adapter in $adapters) {
    Write-Host "Setting DNS for adapter: $($adapter.Name)" -ForegroundColor Cyan
    
    # Set primary DNS to Google
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
    
    Write-Host "DNS set to Google (8.8.8.8, 8.8.4.4) for $($adapter.Name)" -ForegroundColor Green
}

# Flush DNS cache
Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
Clear-DnsClientCache

Write-Host "DNS settings updated successfully!" -ForegroundColor Green
Write-Host "Please restart your terminal and try again." -ForegroundColor Cyan
