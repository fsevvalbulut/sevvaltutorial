const express = require("express");
const pg=require("pg").Pool;
const bodyParser = require('body-parser'); 
const app = express();
const pool=new pg({host:'ec2-54-159-138-67.compute-1.amazonaws.com',database:'dlv5l1746llq4',user:'nffbpqnuvprdjz',password:'e011907cc6ce961655a75495e661afd420bf4bda7eda63b841cfa27793d3b03f',port:'5432',ssl:{rejectUnauthorized:false}});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
const _port = process.env.PORT || 5000;
const _app_folder = __dirname + '/dist' ;
app.use(express.static(__dirname + '/dist' ));

var table_name="trees";
app.get("/api/data",function(req,res)
{
    pool.query("SELECT jsonb_build_object('type','FeatureCollection','features', jsonb_agg(feature)) FROM (SELECT jsonb_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::jsonb, 'properties', to_jsonb(row) - 'gid' - 'geom') AS feature  FROM (SELECT * FROM "+table_name+") row) features;", (err1, res1) => 
        {   
            if(err1) {return console.log(err1);}
            res.json(res1.rows[0]["jsonb_build_object"]);                  
        });         
});

app.post('/post', function(request, response){
    pool.query("INSERT INTO "+table_name+" VALUES('"+request.body.tree_type+"',ST_SETSRID(ST_MAKEPOINT("+request.body.Longitude+","+request.body.Latitude+"),4326));", (err1, res1) => 
        {        
            if(err1) 
                {   console.log(request.body);
                    return console.log(err1);}
                response.statusCode = 200;
                response.setHeader('Content-Type', 'text/plain');
                response.end('Data Store Success!\n');      
        }); 
});

app.all('*', function (req, res) {
    res.status(200).sendFile(`/`, {root: _app_folder});
});

app.listen(_port, function () {
    console.log("Node Express server for " + app.name + " listening on http://localhost:" + _port);
});