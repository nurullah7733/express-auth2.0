var app = require("./app");
app.listen(process.env.PORT, (err: any) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server started on port ${process.env.PORT}`);
  }
});
