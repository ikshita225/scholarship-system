const http = require('http');

async function test() {
    try {
        const loginRes = await fetch("http://localhost:8080/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "official_verifier@scholarship.com", password: "Verifier@2026" })
        });
        
        if (!loginRes.ok) {
            console.log("Login failed", loginRes.status, await loginRes.text());
            return;
        }
        
        const loginData = await loginRes.json();
        const token = loginData.token;
        
        const url = "http://localhost:8080/api/verifier/help-requests/4/status?status=REJECTED_BY_VERIFIER&remarks=income%20proof%20fake.";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
        });
        
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
