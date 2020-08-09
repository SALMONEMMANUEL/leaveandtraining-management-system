// FormGet Online Form Builder JS Code
// Creating and Adding Dynamic Form Elements.
var i = 1; // Global Variable for Name
var j = 1; // Global Variable for E-mail
/*
=================
Creating Text Box for name field in the Form.
=================
*/
function textBoxCreate(){
var y = document.createElement("INPUT");
y.setAttribute("type", "text");
y.setAttribute("Placeholder", "Name_" + i);
y.setAttribute("name", "Name" + i);
document.getElementById("myForm").appendChild(y);
i++;
}
/*
=================
Creating Text Box for email field in the Form.
=================
*/
function emailBoxCreate(){
var y = document.createElement("INPUT");
var t = document.createTextNode("Date");
y.appendChild(t);
y.setAttribute("type", "date" );
y.setAttribute("Placeholder", "Email_" + j);
y.setAttribute("name", "date" + j);
y.setAttribute("required", "required");
document.getElementById("myForm").appendChild(y);
j++;
}