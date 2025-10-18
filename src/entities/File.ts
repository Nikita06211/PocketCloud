import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm'; 

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

    @Column({name: 'file_type', type: 'enum', enum:['pdf', 'jpg', 'txt']})
    fileType!: 'pdf' | 'jpg' | 'txt';

    @ManyToOne('User','files')
    @JoinColumn({name: 'user_id'})
    user!: any;

    @Column({name:'user_id'})
    userId!: number;
    
}