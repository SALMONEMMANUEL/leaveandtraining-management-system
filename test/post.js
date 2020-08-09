const app = require('../app')
const request = require('supertest')
const expect = require('chai').expect

describe("POST /request", function(){

    describe("POST /admin/create-leave", function(){

        it("Must save the data successful", function(){

            let data = { appdate : "20-08-2021", leave : "Anuaell leave", period : 84 } 

            request(app)
            .post('/admin/create-leave')
            .send(data)
        })
    })

})