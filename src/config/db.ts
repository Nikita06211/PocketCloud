import 'reflect-metadata';
import {DataSource} from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: false,
    synchronize: true,
    entities: ['./src/entities/*.ts'],
    migrations: ['./src/migrations/*.ts'],
});

export const connectDB = async () => {
    try{
        await AppDataSource.initialize();
        await AppDataSource.query("SET timezone = 'UTC';");
        console.log('Connected to the database via TypeORM');
    } catch(error){
        console.error('Error connecting to the database via TypeORM', error);
    }
};