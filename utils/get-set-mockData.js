const fs = require('fs');
const FILENAMES = {
    mockPlaneData: 'mocks/openSkyMockData.json',
    mockPlaneTrackData: 'mocks/openSkyMockData.json'
}

const getMockPlaneData = () => {
    return _getMockData(FILENAMES.mockPlaneData)
}

const setMockPlaneData = (data) => {
    _setMockData(FILENAMES.mockPlaneData, data);
}


const _getMockData = (fileName) => {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

const _setMockData = (fileName, data) => {
    fs.writeFile(fileName, data, function(err) {
        if(err) {
            return console.log(err);
        } else { 
            console.log("The file was saved!"); 
        }
    }); 
}

exports.getMockPlaneData = getMockPlaneData;
exports.setMockPlaneData = setMockPlaneData;