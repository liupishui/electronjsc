function getExtraResourcesPath(){
    let path = require('path');
    function getParentDirectory(currentDir, levels) {
        let parentDir = currentDir;
        for (let i = 0; i < levels; i++) {
            parentDir = path.dirname(parentDir);
        }
        return parentDir;
    }
    let destPath = getParentDirectory(__dirname,1)+'/extraResources';
    destPath = destPath.replace('app.asar','unpacked');
    return path.resolve(destPath);
}
module.exports = getExtraResourcesPath;