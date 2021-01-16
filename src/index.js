const express = require('express'); // requisita o express
const { ApolloServer } = require('apollo-server-express'); // incluindo o apollo package
require('dotenv').config();
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

//importar modulos locais
const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// rodar o servidor em uma porta especificada no arquivo .env ou na porta 4000
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

// cria o app object
const app = express();

app.use(helmet());
app.use(cors());

//chamar a conexão com o banco de dados
db.connect(DB_HOST);

const getUser = token => {
    if (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error('Session invalid');
        }
    }
};

//apolo server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
        // pegar o token do cabeçalho
        const token = req.headers.authorization;
        // tentar recuperar o usuário com o token
        const user = getUser(token);
        console.log(user);
        // adicional os db models e o usuário ao contexto
        return { models, user };
    }
});

// aplicar o apollo graphQL middleware e setar o path para /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
    console.log(
        `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    )
);