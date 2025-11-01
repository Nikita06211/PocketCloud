import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm'; 

export enum FileType {
    PDF = 'pdf',
    JPG = 'jpg',
    TXT = 'txt',
}

@Entity()
export class File{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
    })
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
