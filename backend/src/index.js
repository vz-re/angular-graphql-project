const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const { readdir, stat } = require('fs').promises;

const graphql = require('graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList } = graphql
const { graphqlHTTP } = require('express-graphql')

const app = express();
const port = 4000;

async function* getFiles(rootPath) {
    const fileNames = await readdir(rootPath).then(list => list.filter(item => !/(^|\/)\.[^/.]/g.test(item)))
    for (const fileName of fileNames) {
      const path = resolve(rootPath, fileName);
    yield path
    }
}

async function* toObj(filesIter) {
    for await (const filepath of filesIter) yield { filepath };
}

async function* addFileMetadata(objIter) {
    for await (const obj of objIter) {
        const stats = await stat(obj.filepath)
        const isDirectory = stats.isDirectory();
        const size = formatBytes(stats.size)
  
        const permissions = {
          writePermissions: stats["mode"] & fs.constants.W_OK ? 'yes' : 'no',
          readPermissions: stats["mode"] & fs.constants.R_OK ? 'yes' : 'no',
          executePermissions: stats["mode"] & fs.constants.X_OK ? 'yes' : 'no'
        }
        const filename = path.basename(obj.filepath)
        const type = path.extname(obj.filepath)
        const createdDate = new Date(stats.birthtime).toISOString().replace('T', ' ').substring(0, 19)
        yield { ...obj, isDirectory, filename, size, type, createdDate, permissions };
    }
}

async function reduce(asyncIter, f, init) {
    let res = init;
    for await (const x of asyncIter) {
      res = f(res, x);
    }
    return res;
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const PermissionsType = new GraphQLObjectType({
    name: 'PermissionsType',
    fields: () => ({
        writePermissions: { type: GraphQLString },
        readPermissions: { type: GraphQLString },
        executePermissions: { type: GraphQLString },
    })
})

const FileType = new GraphQLObjectType({
    name: 'File',
    fields: () => ({
        isDirectory: { type: GraphQLBoolean },
        filepath: { type: GraphQLString },
        filename: { type: GraphQLString },
        size: { type: GraphQLString },
        type: { type: GraphQLString },
        createdDate: { type: GraphQLString },
        permissions: { type: PermissionsType }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        getDirContent: {
            type: new GraphQLList(FileType),
            args: {
                filepath: {
                    type: GraphQLString
                }
            },
            resolve(parents, args){
                return (async () => { 
                    const toArray = iter => reduce(iter, (a, x) => (a.push(x), a), []);
                    const files = await toArray(addFileMetadata(toObj(getFiles(args.filepath)))); 
                    const rebuiltArray = [
                        ...files.filter(x => x.isDirectory),
                        ...files.filter(x => !x.isDirectory)
                      ];
                    return rebuiltArray
                })()
            }
        },
    }
})

const schema = new GraphQLSchema({
    query: RootQueryType
});

app.use(cors());
app.use(
    '/graphql', 
    graphqlHTTP({
        schema, 
        graphiql:true
    })
);

app.listen(port, ()=> {
    console.log("server is running")
});