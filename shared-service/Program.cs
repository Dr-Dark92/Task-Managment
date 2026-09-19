using Microsoft.Data.Sqlite;
using System.Text.Json;
using System.Text.Json.Nodes;

var builder=WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("TM_LISTEN") ?? "http://0.0.0.0:8787");
var app=builder.Build();
app.Use(async(ctx,next)=>{
 ctx.Response.Headers["Access-Control-Allow-Origin"]="*";
 ctx.Response.Headers["Access-Control-Allow-Headers"]="Content-Type";
 ctx.Response.Headers["Access-Control-Allow-Methods"]="GET,POST,PUT,DELETE,OPTIONS";
 if(ctx.Request.Method=="OPTIONS"){ctx.Response.StatusCode=204;return;} await next();
});
var root=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),"TaskManagement");
Directory.CreateDirectory(root);
var dbPath=Environment.GetEnvironmentVariable("TM_DB_PATH") ?? Path.Combine(root,"task-management.db");
var cs=new SqliteConnectionStringBuilder{DataSource=dbPath,Mode=SqliteOpenMode.ReadWriteCreate,Cache=SqliteCacheMode.Shared}.ToString();
using(var db=new SqliteConnection(cs)){db.Open();var cmd=db.CreateCommand();cmd.CommandText=@"PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS records(store TEXT NOT NULL,id INTEGER NOT NULL,json TEXT NOT NULL,PRIMARY KEY(store,id));
CREATE TABLE IF NOT EXISTS sequences(store TEXT PRIMARY KEY,next_id INTEGER NOT NULL);";cmd.ExecuteNonQuery();}
long NextId(SqliteConnection db,string store){
 using var tx=db.BeginTransaction();var q=db.CreateCommand();q.Transaction=tx;q.CommandText="SELECT next_id FROM sequences WHERE store=$s";q.Parameters.AddWithValue("$s",store);var x=q.ExecuteScalar();long id=x is null?1:Convert.ToInt64(x);var u=db.CreateCommand();u.Transaction=tx;u.CommandText=@"INSERT INTO sequences(store,next_id) VALUES($s,$n) ON CONFLICT(store) DO UPDATE SET next_id=$n";u.Parameters.AddWithValue("$s",store);u.Parameters.AddWithValue("$n",id+1);u.ExecuteNonQuery();tx.Commit();return id;
}
JsonNode? Parse(string s)=>JsonNode.Parse(s);
app.MapGet("/api/health",()=>Results.Ok(new{ok=true,mode="shared",database=dbPath}));
app.MapGet("/api/store/{store}/count",(string store)=>{using var db=new SqliteConnection(cs);db.Open();var q=db.CreateCommand();q.CommandText="SELECT COUNT(*) FROM records WHERE store=$s";q.Parameters.AddWithValue("$s",store);return Results.Ok(new{count=Convert.ToInt64(q.ExecuteScalar())});});
app.MapGet("/api/store/{store}",(string store,string? index,string? value)=>{
 using var db=new SqliteConnection(cs);db.Open();var q=db.CreateCommand();q.CommandText="SELECT json FROM records WHERE store=$s ORDER BY id";q.Parameters.AddWithValue("$s",store);using var rd=q.ExecuteReader();var rows=new List<JsonNode?>();while(rd.Read())rows.Add(Parse(rd.GetString(0)));
 if(!string.IsNullOrWhiteSpace(index)&&value is not null){JsonNode? wanted;try{wanted=JsonNode.Parse(value);}catch{wanted=JsonValue.Create(value);}rows=rows.Where(x=>JsonNode.DeepEquals(x?[index],wanted)).ToList();}
 return Results.Ok(rows);
});
app.MapGet("/api/store/{store}/{id:long}",(string store,long id)=>{using var db=new SqliteConnection(cs);db.Open();var q=db.CreateCommand();q.CommandText="SELECT json FROM records WHERE store=$s AND id=$i";q.Parameters.AddWithValue("$s",store);q.Parameters.AddWithValue("$i",id);var x=q.ExecuteScalar() as string;return x is null?Results.NotFound():Results.Text(x,"application/json");});
app.MapPost("/api/store/{store}",async(string store,HttpRequest req)=>{
 var node=await JsonNode.ParseAsync(req.Body) as JsonObject;if(node is null)return Results.BadRequest(new{error="JSON object required"});
 using var db=new SqliteConnection(cs);db.Open();var id=NextId(db,store);node["id"]=id;var q=db.CreateCommand();q.CommandText="INSERT INTO records(store,id,json) VALUES($s,$i,$j)";q.Parameters.AddWithValue("$s",store);q.Parameters.AddWithValue("$i",id);q.Parameters.AddWithValue("$j",node.ToJsonString());q.ExecuteNonQuery();return Results.Ok(id);
});
app.MapPut("/api/store/{store}",async(string store,HttpRequest req)=>{
 var node=await JsonNode.ParseAsync(req.Body) as JsonObject;if(node is null||node["id"] is null)return Results.BadRequest(new{error="Object with id required"});var id=node["id"]!.GetValue<long>();
 using var db=new SqliteConnection(cs);db.Open();var q=db.CreateCommand();q.CommandText=@"INSERT INTO records(store,id,json) VALUES($s,$i,$j) ON CONFLICT(store,id) DO UPDATE SET json=$j";q.Parameters.AddWithValue("$s",store);q.Parameters.AddWithValue("$i",id);q.Parameters.AddWithValue("$j",node.ToJsonString());q.ExecuteNonQuery();return Results.Ok(id);
});
app.MapDelete("/api/store/{store}/{id:long}",(string store,long id)=>{using var db=new SqliteConnection(cs);db.Open();var q=db.CreateCommand();q.CommandText="DELETE FROM records WHERE store=$s AND id=$i";q.Parameters.AddWithValue("$s",store);q.Parameters.AddWithValue("$i",id);q.ExecuteNonQuery();return Results.NoContent();});
app.MapPost("/api/admin/clear",async(HttpRequest req)=>{var body=await JsonNode.ParseAsync(req.Body) as JsonObject;var stores=body?["stores"] as JsonArray;if(stores is null)return Results.BadRequest();using var db=new SqliteConnection(cs);db.Open();using var tx=db.BeginTransaction();foreach(var n in stores){var s=n?.GetValue<string>();if(string.IsNullOrWhiteSpace(s))continue;var q=db.CreateCommand();q.Transaction=tx;q.CommandText="DELETE FROM records WHERE store=$s";q.Parameters.AddWithValue("$s",s);q.ExecuteNonQuery();}tx.Commit();return Results.Ok(new{ok=true});});
app.Run();
