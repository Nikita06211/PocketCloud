import {AppDataSource} from "../config/db";
import {File} from "../entities/File";

export const fileRepository = AppDataSource.getRepository(File);

export const createFile = async (fileData: Partial<File>) => {
    const file = fileRepository.create({
        ...fileData,   
    });
    return await fileRepository.save(file);
};


export const findFileById = async(id: string)=>{
    return await fileRepository.findOne({where: {id}});
};

export const findFilesByUserId = async(userId: number)=>{
    return await fileRepository.find({where:{userId}});
};

export const deleteFile = async (id: string)=>{
    return await fileRepository.delete(id);
}

export const findExpiredFiles = async () => {
    const now = new Date();
    return await fileRepository
        .createQueryBuilder('file')
        .where('file.created_at + INTERVAL \'1 hour\' * file.expiration_hours < :now', { now })
        .getMany();
};

export const isFileExpired = async(fileId: string): Promise<boolean> =>{
    const file = await findFileById(fileId);
    if(!file) return true;
    
    const now = new Date();
    
    if (!file.expirationHours || file.expirationHours <= 0) {
        return true;
    }
    
    const expirationDate = new Date(
        file.createdAt.getTime() + file.expirationHours * 60 * 60 * 1000
    );
    
    return now > expirationDate;
};

export const deleteExpiredFiles = async () => {
    const expiredFiles = await findExpiredFiles();
    for(const file of expiredFiles){
        await deleteFile(file.id);
    }
    return expiredFiles.length;
};