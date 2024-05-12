const mongoose = require('mongoose');
const schema = mongoose.Schema;
const postSchema = new schema ({
    titulo: String,
    imagem: String,
    categoria: String,
    conteudo: String,
    slug: String,
    autor: String,
    views: Number,
},{collection:'post'});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;