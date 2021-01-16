module.exports = {
    notes: async(parent, args, { models }) => {
        return await models.Note.find();
    },
    note: async(parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },
    user: async(parent, { username }, { models }) => {
        return await models.User.findOne({ username });
    },
    users: async(parent, args, { models }) => {
        return await models.User.find({});
    },
    me: async(parent, args, { models, user }) => {
        return await models.User.findById(user.id);
    },
    noteFeed: async(parent, { cursor }, { models }) => {
        const limit = 10;
        let hasNextPage = false;
        // if no cursor is passed the default query will be empty
        //this will pull the newest notes from db
        let cursorQuery = {};

        // if there is a cursor, our query will look for notes with an
        // objectid menor que a do cursor
        if (cursor) {
            cursorQuery = { _id: { $lt: cursor } };
        }
        // find the limit +1 of notes in our db, sorted newest to oldest
        let notes = await models.Note.find(cursorQuery)
            .sort({ _id: -1 })
            .limit(limit + 1);
        if (notes.length > limit) {
            hasNextPage = true;
            notes = notes.slice(0, -1);
        }

        const newCursor = notes[notes.length - 1]._id;

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
};
// query chamada hello que vai retornar uma string
// a ! indica que o campo deve receber um valor
// notes: [Note!] - vai retornar um array de objetos Note
//note(id: ID!): Note! - requisição de nota, quem usa o argumento id, do tipo ID e retorna uma nota

// resolver que rotornará um valor ao usuário