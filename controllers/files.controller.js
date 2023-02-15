const response = require('express');
const path = require('path');
const fs = require('fs-extra');

const { handlerPhoto, handlerFolder } = require('../helpers/handlerFile.helper');
  
const uploadPhoto = async (req, resp = response) => { 
    const folder = req.params.folder;
    const id = req.params.id;
    const file = req.file
    try {
        if (!file) {    
            return resp.status(400).json({
                ok: false,
                message: `you don't provide any photo`,
                
            });
        }
    
        // get file extension
        const nameChunck = file.originalname.split('.');
        const fileExtension = nameChunck[nameChunck.length - 1];
        // validate extesion 
        const allowedExtension = ['jpg', 'png', 'jpeg', 'gif'];
        if (!allowedExtension.includes(fileExtension)) { 
            await fs.unlink(file.path)
            return resp.status(403).json('extension file not allow');
        }
    
        const isPathAvailable = ['hospitals', 'doctors', 'users', 'patients'];
        //  validate if one those folders are avilable on claudinary
        if (!isPathAvailable.includes(folder)) {    
            return resp.status(403).json({
                ok: false,
                message: 'path not found',
                
            });
        }
        
        
        const schema = await handlerFolder(folder, id);
    
        if (schema) {
            const cloudinary_response = await handlerPhoto.uploadPhoto(folder, schema, file.originalname, file.path)
            await fs.unlink(file.path)
            if (cloudinary_response) {
                
                return resp.status(200).json({
                    ok: true,
                    message: 'Photo upload success',
                });
            } else {
                return resp.status(404).json({
                    ok: false,
                    message: `we could'nt upload photo`,
                });
            }
    
        } else { 
            await fs.unlink(file.path)
            return resp.status(404).json({
                ok: false,
                message: `we could'nt fould any document at ${folder} in db`,
            });
        }

    
        
    } catch (error) {
        return resp.status(500).json({
            ok: true,
            message: `Sorry something wrong `, error,
        })
    }
    
    
    
}

const deletePhoto = async (req, resp) =>{ 
    const folder = req.params.folder;
    const id = req.params.id;

    
    try {
        const schema = await handlerFolder(folder, id);

        if (schema) {
    
        const cloudinary_response = await handlerPhoto.destroyPhoto( schema )
        if (cloudinary_response) {
            return resp.status(200).json({
                ok: true,
                message: 'Photo delete success',
                });
        } else {
            return resp.status(404).json({
                ok: false,
                message: `we could'nt delete photo` ,
            }); 
        }

       

    }
    return resp.status(404).json({
        ok: false,
        message: `we could'nt fould any document at ${folder} in db`,
    });
    } catch (error) {
        return resp.status(500).json({
            ok: true,
            message: `something wrong`,
        });
    }
    
}

returnImage = async (req, resp = response) => { 
    const schema = req.params.schema;
    const file = req.params.file

    const imgPath = path.join(__dirname, `../uploads/${schema}/${file}`);
    if (fs.existsSync(imgPath)) {
        resp.sendFile(imgPath);
    } else { 
       //could be other static path// const imgPath = path.join(__dirname, `../uploads/${schema}/${file}`);
        resp.status(404).json({
            message:'we could find this img on path'
        });
    }
}

module.exports = { uploadPhoto, deletePhoto,  returnImage };