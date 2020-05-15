const CosmosClient = require('@azure/cosmos').CosmosClient;
const config = require('../config/config');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomB = require('crypto-random-string')

const endpoint = config.endpoint;
const key = config.key;

const client = new CosmosClient({
    endpoint : endpoint,
    key : key 
});

const databaseId = config.databaseId;
const containerId = config.containerId;
const partitionKey = 'users';

const getAllUser =async (req, res, next) => {
    const querySpec = {
        query: 'SELECT * FROM c WHERE c.datatype = @datatype',
        parameters: [
        {
            name: '@datatype',
            value: "users"
        }
        ]
    }

    const { resources: results } = await client
        .database(databaseId)
        .container(containerId)
        .items.query(querySpec)
        .fetchAll()
    
    //return results;
    if(results.length >= 0){
        res.status(200).send(results);
    }else{
        res.status(404).json({
            message : 'User Not found'
        });
    }
};


const userRegister = async (req, res, next) => {
    const id = 'uid_'+ randomB({length: 20});
    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.password;
    const password = await bcrypt.hash(pass,8);
    const phoneNo = req.body.phoneNo;
    const address = req.body.address;
    const token = jwt.sign({
        _id : id.toString()
        }, 
            'secretkey', 
        {
            expiresIn : '1 day'
        });

    const user = {
        'id' : id,
        'name':name,
        'email' : email,
        'password' : password,
        'phoneNo' : phoneNo,
        'address' : address,
        'datatype' : partitionKey,
        'tokens' : [{
            'token': {
                token
            }
        }]
    };
    const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items
    .create(user);

    res.status(201).json({
        message : 'User Created Successfully',
    });
};
const getOneUser = async (req, res, next) => {
    const id = req.params.userID;

    const { resource } = await client
    .database(databaseId)
    .container(containerId)
    .item(id, partitionKey)
    .read()
    
    //return resource;

    if(resource){
        res.status(200).send(resource);
    }else{
        res.status(404).json({
            message : 'No valid entry found for user ID'
        });
    }  
};

const updateuser = async (req, res, next) => {
    const id = req.params.userID;


    const { resource } = await client
    .database(databaseId)
    .container(containerId)
    .item(id, partitionKey)
    .read()

    const name = req.body.name;
    const email = resource.email;
    const pass = resource.password;
    const phoneNo = req.body.phoneNo;
    const address = req.body.address;
    const token = resource.tokens;

    const user = {
        'id' : id,
        'name':name,
        'email' : email,
        'password' : pass,
        'phoneNo' : phoneNo,
        'address' : address,
        'datatype' : partitionKey,
        'tokens' : token
    };

    const { item:replaced } = await client
    .database(databaseId)
    .container(containerId)
    .item(id, partitionKey)
    .replace(user);

    res.status(201).json({
        message : 'User Updated Successfully',
    });

};

const deleteuser = async (req, res, next) => {
    const id = req.params.userID;

    const { resource } = await client
    .database(databaseId)
    .container(containerId)
    .item(id, partitionKey)
    .delete()

    res.status(200).send({
        message : 'User Deleted Successfully!'
    });
};



module.exports = {
    userRegister,
    getAllUser,
    getOneUser,
    updateuser,
    deleteuser  
};
