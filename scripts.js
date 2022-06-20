var email;

//Reads JWT Token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

//Handle response from login
function handleCredentialResponse(response) {
    var responsePayload = parseJwt(response.credential);
    email = responsePayload.email;
    alert("Hello " + email);
    var details = users[email];
    if(detals != null){
        alert(details.name+": "+details.class);
    }
}


window.onload = function() {
        
    //Build Login button
    google.accounts.id.initialize({
        client_id: "962020932017-6ievr5uml2qfs8nbfmli3m4vbnvcjqgu.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"), {
            theme: "outline",
            size: "large"
        } // customization attributes
    );
}