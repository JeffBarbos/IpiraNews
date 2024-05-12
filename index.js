const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Post = require('./post')
var bodyparser = require('body-parser');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'))
app.use( bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb+srv://root:uXRc78oOKrvQvIpG@ipiranews.rcbcrdm.mongodb.net/informacao?retryWrites=true&w=majority&appName=Ipiranews',{useNewUrlParser: true, useUnifiedTopology: true})
.then(function(){
    console.log('conectado no banco de dado')
}).catch(function(err){
    console.log(err.message)
})

app.get('/', (req,res) =>{
    if(req.query.search == null){
        Post.find({}).sort({'_id': -1}).exec(function(err, post){
            post = post.map(function(val){
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
            })

            Post.find({}).sort({'views': -1}).limit(3).exec(function(err,posttop){
                posttop = posttop.map(function(val){
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })

                res.render('home',{post:post, posttop:posttop})
            })
        })
    }
    else{
        Post.find({titulo: {$regex:req.query.search, $options:"i"}},function(err, post){
            res.render('search',{post:post,contagem:post.length});
        })
    }

})
    

app.get('/:slug', (req,res) =>{
    Post.findOneAndUpdate({slug: req.params.slug}, {$inc: {views: 1}}, {new:true}, function(err, resp){
        if(resp != null){
            Post.find({}).sort({'views': -1}).limit(3).exec(function(err,posttop){
                posttop = posttop.map(function(val){
                    return{
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                })

                res.render('single',{noticia:resp, posttop:posttop});
            })
        } else{
            res.render('error');
        }
    })
})
app.listen(5000, () => {
    console.log('server rodando');
})