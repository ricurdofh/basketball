/***** Helpers para Handlebars ******/

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('inc', function (val) {
    return val + 1;
});

Handlebars.registerHelper('eq', function (lval, rval, options) {
    return (lval === rval) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("getContext", function () {
    return JSON.stringify(this);
});