import express from 'express'
import expressWs from 'express-ws'
import log4js from 'log4js'
import fs from 'fs'

const app = express()
const port = process.env.PORT

expressWs(app)

function getLogs() {
    let logsStr = fs.readFileSync('report.log', 'utf8');
    return logsStr.split(/[(\r\n)\r\n]+/);
}

log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: "report.log",
        },
        /*datafile: {
            type: 'dateFile',
            filename: "report.log",
            pattern: ".yyyy-MM-dd"
        },*/
        console: {type: 'console'},
    },
    categories: {
        default: {appenders: ['console'], level: 'debug'},
        reportor: {appenders: ['file', 'console'], level: 'debug'},
    }
});

const logger = log4js.getLogger('reportor');

let WS = null;

app.set("view engine", "ejs")
app.set("views", "./pages")

app.use(express.json())

app.get('/', (req, res) => {
    res.status(500).send('嘿嘿嘿!')
})

app.get('/logs', (req, res) => {
    const logs = getLogs()
    res.render('logs', {logs});
})

app.post('/report', (req, res) => {
    const {body} = req;
    let mark = '',
        message = body.data.message;
    if (body.data.code) {
        logger.info(message)
        mark = '[INFO] reportor - ';
    } else {
        logger.error(message)
        mark = '[ERROR] reportor - ';
    }
    const data = `[${new Date().toString()}] ${mark}${message}`;
    WS && WS.send(data);
    res.send({message: 'OK'})
})

app.ws('/report', function (ws, req) {
    // ws.send('你连接成功了')
    WS = ws;
})


app.listen(port, () => {
    console.log(`接收报告服务已在 ${port} 端口运行`)
})

/*const clock = setInterval(()=>{
	if(new Date().getHours() == 1) {
		fs.writeFileSync('report.log', '');
	}
}, 59*60*1000)*/
