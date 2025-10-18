import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({name: 'first_name'})
    firstName! : string;

    @Column({name: 'last_name'})
    lastName! : string;

    @Column({unique: true})
    email! : string;

    @Column({nullable: false})
    password! : string;

    @CreateDateColumn({name: 'created_at'})
    createdAt! : Date;

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt! : Date;

    @OneToMany('File','user')
    files!: any[];
}