const express = require('express');
const app = express();
const fs = require('fs');
const fileupload = require('express-fileupload')
const path = require('path');
const mongoose = require('mongoose');
const Post = require('./post')
var bodyparser = require('body-parser');
var session = require('express-session');
const fileUpload = require('express-fileupload');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'))
app.use( bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
}))

app.use(session({secret: 'keyboard cat',cookie: { maxAge: 60000 }}))

mongoose.connect('mongodb+srv://root:QAlNeCSVrcV4FbUV@ipiranews.rcbcrdm.mongodb.net/informacao?retryWrites=true&w=majority&appName=Ipiranews',{useNewUrlParser: true, useUnifiedTopology: true})
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

var users = [
    {
        user: 'jeferson',
        pass: '1234567'
    }
]

app.post('/admin/login', (req,res)=>{
    users.map(function(val){
        if(val.user == req.body.user && val.pass == req.body.pass){
            req.session.user = "jeferson";
        }
    })
 
    res.redirect('/admin/login');
})


app.post('/admin/cadastro',(req,res)=>{
    const { titleNews, urlImg, news, slug } = req.body;

    let formato = req.files.arquivo.name.split('.');
    var imagem = "";

    if(formato[formato.length - 1] == "jpg"){
        imagem = new Date().getTime()+'.jpg';
        req.files.arquivo.mv(__dirname+'/public/imagens/'+imagem);
    }else{
        fs.unlinkSync(req.files.arquivo.tempFilePath);
    }

    Post.create({
        titulo: titleNews,
        imagem: 'http://localhost:5000/public/imagens/' + imagem,
        categoria: 'nenhuma',
        conteudo: news, 
        slug: slug,
        autor: 'admin',
        views: 0,
    },
        (err, post) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
    });
    res.redirect('/admin/login');
})

app.get('/admin/deletar/:id', (req,res)=>{
    Post.deleteOne({_id:req.params.id}).then(function(){
       res.redirect('/admin/login')
    })
    
})
app.get('/admin/login',(req,res)=>{
    if(req.session.user == null){
        res.render('admin-login');
    }else{
        Post.find({}).sort({'_id': -1}).exec(function(err,posts){
            posts = posts.map(function(val){
                return{
                    id: val._id,
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
            })

            res.render('admin-panel',{posts:posts})
        })
        
    }
    
})
app.listen(5000, () => {
    console.log('server rodando');
})