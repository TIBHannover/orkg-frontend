# Do not commit after running this script, since changes are made to files that shouldn't be committed

GIT_VERSION=$(git describe --tags --abbrev=0)
sed -ie "s/GIT_VERSION/$GIT_VERSION/g" src/components/Layout/Footer.js

#awk '/CHANGELOG_TEXT/{system("cat CHANGELOG.md");next}1' src/components/StaticPages/Changelog.js > testfile.tmp && mv testfile.tmp src/components/StaticPages/Changelog.js 
cp CHANGELOG.md src/components/StaticPages/