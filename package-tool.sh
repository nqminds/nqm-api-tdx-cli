# Create the os package folder
mkdir -p bin/os/
npm install --no-save puppeteer-core
cp config.app.json config.app.json.temp
sed -i 's/"puppeteer"/"puppeteer-core"/g' config.app.json

# Create the packaged binary
pkg package.json --out-path bin/os

mv config.app.json.temp config.app.json
mv ./bin/os/nqm-tdx-terminal-cli-linux ./bin/os/tdxcli
mv ./bin/os/nqm-tdx-terminal-cli-macos ./bin/os/tdxcli-macos
mv ./bin/os/nqm-tdx-terminal-cli-win.exe ./bin/os/tdxcli.exe

version=$(./bin/os/tdxcli -v)

IFS='.' # space is set as delimiter
read -ra VER <<< "${version}" # str is read into an array as tokens separated by IFS
version="${VER[0]}.${VER[1]}-${VER[2]}"
echo "Creating debian package for version $version"

# Create package folders
pkgname="tdxcli_$version"
mkdir -p "bin/os/$pkgname"
mkdir -p "bin/os/$pkgname/usr"
mkdir -p "bin/os/$pkgname/usr/local"
mkdir -p "bin/os/$pkgname/usr/local/bin"
cp ./bin/os/tdxcli "bin/os/$pkgname/usr/local/bin"

# Make deb package
mkdir -p "bin/os/$pkgname/DEBIAN"
controlfile="bin/os/$pkgname/DEBIAN/control"

# Save control file
> "${controlfile}"
echo "Package: tdxcli" >> "${controlfile}"
echo "Version: $version" >> "${controlfile}"
echo "Section: base" >> "${controlfile}"
echo "Priority: optional" >> "${controlfile}"
echo "Architecture: amd64" >> "${controlfile}"
echo "Maintainer: Alexandru Mereacre <mereacre@nquiringminds.com>" >> "${controlfile}"
echo "Description: Command-line interface for accessing the TDX API" >> "${controlfile}"

cd ./bin/os
dpkg-deb --build "$pkgname"
