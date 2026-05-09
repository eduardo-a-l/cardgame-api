using Microsoft.EntityFrameworkCore;
using CardGameApi.Data;
using CardGameApi.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapCartaEndpoints(); 
app.MapBaralhoEndpoints();
app.MapUsuarioEndpoints();
app.MapLojaEndpoints();

app.Run();