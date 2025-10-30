import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm'; 

export enum FileType {
    PDF = 'pdf',
    JPG = 'jpg',
    TXT = 'txt',
}
// delete file from s3 and database
// I want to build a funtionality where an event is triggered after every short interval of time that hits an endpoint which returns all the expired files s3keys and are deleted from s3 bucket and db as well, tell me how can i utilise lambda functions for this and how to build this event trigger 
@Entity()
export class File{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @CreateDateColumn({name: 'created_at'})
    createdAt!: Date;

    @Column({name: 'expiration_hours', type: 'int'})
    expirationHours!: number;

    @Column({name: 's3_key'})
    s3Key!: string;

    @Column({name: 'file_type', type: 'enum', enum:FileType})
    fileType!: FileType;

    @ManyToOne('User','files')
    @JoinColumn({name: 'user_id'})
    user!: any;

    @Column({name:'user_id'})
    userId!: number;
    
}
