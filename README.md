# Another Built Express CMS
### Just a simple CMS to get started


The purpose for this project are for learning and sharing. You can use this project as your go
to CMS if there is a project that may need. the stack used by this CMS. I almost use this for everything on
my project because I was a one man programmer back-then when it comes to code node.js. I build new ones someday with new stack, actually it is almost finished [vf-cms](https://github.com/mandaputtra/vf-cms). I just dont have more enough time again :sad: . This project uses this stack, it almost fast as it get if I may say, just bench mark yourself :smile:

1. Express
2. Redis
3. Pug (Templating)
4. Babel
5. Knex.js / Bookshelf
6. Mysql

I've been making this on my office time, this help me a lot as a go to project. when i need a CMS
on my project. The code are now OpenSource as it deployed on github in first day. Please feel free to open up
issue on security or whatever to improve this code and CMS.

### Important
I do not updated again this CMS ill prepare to make the new one because this time I really love to use REST API a lot
its simple for me as a fullstack dev, and I can leverage more power on front-end. **HOWEVER** Ill still maintain it if anyone do pull request or
something ill be very thankfull 💗

Okay now for Documentation you can read it below (or you can just read the code):


## Documentation

### How to run?

There a *backup mysql* database there, import it first it fills up with users and roles.

```bash
$ yarn
$ yarn start
```

and the project will be run! if not tell me then ...

### Where is the ...?
The folder structure is damn simple I place all routes controller on `src/modules/` Please when using this leverage the modlue system of javascript.
Just pretend like `index.js` are source of everythings!

Example is the folder user on `src/modules/user` if you want to access the model you could just access it from `index.js`

```JavaScript
import { whateverModel, whateverModel2 } from '../user/model'
```

Same for everything controller and yeah, almost everthing. this can save you a lot of time to find where the
file and what code could be broken, and more clear on naming things.

#### Important
Make sure one file are only doing one things.

1. routes.js for declaring routes.
2. message.js are for req.flash() message to the client
3. middleware.js only for middleware
4. and so on ...

and import that on index.js!

... and the rest you can figure it out. Or if you find something usefull for docs here fell free to update this README.md
