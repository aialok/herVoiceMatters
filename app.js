//jshint esversion:6 
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require("mongoose");
const md5 = require('md5');
const nodemailer = require('nodemailer');
mongoose.connect("mongodb+srv://thematrix:DCSgvBAZIgfDYL8w@cluster0.ku1kg6o.mongodb.net/herVoiceMattersDB");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const userSignUpSchema = new mongoose.Schema({
    fullName: String,
    userEmail: String,
    passWord: String,
    favPet: String
})
const adminSignUpSchema = new mongoose.Schema({
    adminFullName: String,
    adminEmail: String,
    adminUniqueID: String,
    adminState: String,
    adminDistrict: String,
    adminContact: Number,
    adminPassword: String
})
const superAdminSchema = new mongoose.Schema({
    secretKey: String,
    uniqueAuthenticationID: String,
    superAdminEmail: String,
    superAdminContact: Number
})
const cgovcomplaintSchema = new mongoose.Schema({
    cgovname: String,
    cgovdesignation: String,
    cgovcontact: Number,
    cgovemail: String,
    cgovaadhar: Number,
    cgovorganisation: String,
    cgovaccused: String,
    cgovdep: String,
    cgovrel: String,
    cgovicc: String,
    cgovbrief: String,
    cgovstate: String,
    cgovdistrict: String,
    cgovstatus: String
})

const sgovcomplaintSchema = new mongoose.Schema({
    sgovname: String,
    sgovdesignation: String,
    sgovcontact: Number,
    sgovemail: String,
    sgovaadhar: Number,
    sgovaccused: String,
    sgovdep: String,
    sgovrel: String,
    sgovicc: String,
    sgovbrief: String,
    sgovstate: String,
    sgovdistrict: String,
    sgovstatus: String
})

const privcomplaintSchema = new mongoose.Schema({
    privname: String,
    privdesignation: String,
    privcontact: Number,
    privemail: String,
    privaadhar: Number,
    privorgname: String,
    privorgcontact: String,
    privorgemail: String,
    privorghead: String,
    privorgstate: String,
    privorgdistrict: String,
    privaccused: String,
    privdep: String,
    privrel: String,
    privicc: String,
    privbrief: String,
    privstatus: String
})

const complaintStatusSchema = new mongoose.Schema({
    complaintstatus: String,
    employeeType: String,
    complaintID: String,
    complaintuserEmail: String
})



const UserData = new mongoose.model("UserData", userSignUpSchema);
const AdminData = new mongoose.model("AdminData", adminSignUpSchema);
const SuperAdminData = new mongoose.model("SuperAdminData", superAdminSchema);
const CgovComplaint = new mongoose.model("CgovComplaint", cgovcomplaintSchema);
const SgovComplaint = new mongoose.model("SgovComplaint", sgovcomplaintSchema);
const PrivComplaint = new mongoose.model("PrivComplaint", privcomplaintSchema);
const ComplaintStatus = new mongoose.model("ComplaintStatus", complaintStatusSchema);

// const newSuperAdmin = new SuperAdminData({
//     secretKey: md5("JH012345"),
//     uniqueAuthenticationID: md5("AF12N3K4N5"),
//     superAdminEmail: "luckykhateeb4@gmail.com",
//     superAdminContact: 9905522972
// })

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/signupUser", (req, res) => {
    res.render("signupUser", {
        newUserMessage: ""
    })
})

app.post("/signupUser", async (req, res) => {
    const newUserGateway = await UserData.findOne({ userEmail: req.body.useremail });
    if (newUserGateway == null) {
        const newuser = new UserData({
            fullName: req.body.userfullname,
            userEmail: req.body.useremail,
            passWord: md5(req.body.userpassword),
            favPet: req.body.userpetname
        })
        await newuser.save();
        const userDataId = await UserData.findOne({ userEmail: req.body.useremail });
        res.redirect("/user/" + userDataId._id);
    } else {
        res.render("userLogin", {
            passErrMessage: "You are already a user, login from here"
        })
    }
})

app.get("/userLogin", (req, res) => {
    res.render("userLogin", {
        passErrMessage: ""
    });
})

app.post("/userLogin", async (req, res) => {
    const previousUser = await UserData.findOne({ userEmail: req.body.useremail });
    const complaintStatusObj = await ComplaintStatus.findOne({ complaintuserEmail: previousUser.userEmail })
    const complaintStatus = complaintStatusObj.complaintstatus;
    const complaintIDStr = complaintStatusObj.complaintID;
    console.log(complaintStatusObj);
    if (previousUser == null) {
        res.render("signupUser", {
            newUserMessage: "You are new here, please signUp"
        })
    } else {
        if (previousUser.passWord === md5(req.body.userpassword)) {
            let accused = ""
            let aadhar = ""
            let designation = ""
            let department = ""
            let relation = ""
            let icc = ""
            let complaintbrief = ""
            let state = ""
            let distric = ""
            let userComplaintFind = await CgovComplaint.findOne({ cgovemail: previousUser.userEmail });
            if (userComplaintFind == null) {
                userComplaintFind = await SgovComplaint.findOne({ sgovemail: previousUser.userEmail });
                if (userComplaintFind == null) {
                    userComplaintFind = await PrivComplaint.findOne({ privemail: previousUser.userEmail });
                    if (userComplaintFind == null) {
                        userComplaintFind = "";
                    } else {
                        accused = userComplaintFind.privaccused;
                        aadhar = userComplaintFind.privaadhar;
                        designation = userComplaintFind.privdesignation;
                        department = userComplaintFind.privdep;
                        relation = userComplaintFind.privrel;
                        icc = userComplaintFind.privicc;
                        complaintbrief = userComplaintFind.privbrief;
                        state = userComplaintFind.privorgstate;
                        distric = userComplaintFind.privorgdistrict;
                    }
                } else {
                    accused = userComplaintFind.sgovaccused;
                    aadhar = userComplaintFind.sgovaadhar;
                    designation = userComplaintFind.sgovdesignation;
                    department = userComplaintFind.sgovdep;
                    relation = userComplaintFind.sgovrel;
                    icc = userComplaintFind.sgovicc;
                    complaintbrief = userComplaintFind.sgovbrief;
                    state = userComplaintFind.sgovstate;
                    distric = userComplaintFind.sgovdistrict;

                }
            } else {
                accused = userComplaintFind.cgovaccused;
                aadhar = userComplaintFind.cgovaadhar;
                designation = userComplaintFind.cgovdesignation;
                department = userComplaintFind.cgovdep;
                relation = userComplaintFind.cgovrel;
                icc = userComplaintFind.cgovicc;
                complaintbrief = userComplaintFind.cgovbrief;
                state = userComplaintFind.cgovstate;
                distric = userComplaintFind.cgovdistrict;
            }

            res.render("userPage", {
                fullName: previousUser.fullName,
                useremail: previousUser.userEmail,
                favouritepet: previousUser.favPet,
                // complaint details
                Accused: accused,
                Aadhar: aadhar,
                Designation: designation,
                Department: department,
                Relation: relation,
                ICC: icc,
                Complaintbrief: complaintbrief,
                State: state,
                District: distric,
                complaintid: complaintIDStr,
                complaintstatus: complaintStatus
            })

        } else {
            res.render("userLogin", {
                passErrMessage: "Entered password is wrong"
            })
        }
    }
})

app.get("/user/:customUserId", async (req, res) => {
    const customuserID = req.params.customUserId;
    const customuser = await UserData.findOne({ _id: customuserID });
    let accused = ""
    let aadhar = ""
    let designation = ""
    let department = ""
    let relation = ""
    let icc = ""
    let complaintbrief = ""
    let state = ""
    let distric = ""
    let userComplaintFind = await CgovComplaint.findOne({ cgovemail: customuser.userEmail });
    if (userComplaintFind == null) {
        userComplaintFind = await SgovComplaint.findOne({ sgovemail: customuser.userEmail });
        if (userComplaintFind == null) {
            userComplaintFind = await PrivComplaint.findOne({ privemail: customuser.userEmail });
            if (userComplaintFind == null) {
                userComplaintFind = "";
            } else {
                accused = userComplaintFind.privaccused;
                aadhar = userComplaintFind.privaadhar;
                designation = userComplaintFind.privdesignation;
                department = userComplaintFind.privdep;
                relation = userComplaintFind.privrel;
                icc = userComplaintFind.privicc;
                complaintbrief = userComplaintFind.privbrief;
                state = userComplaintFind.privorgstate;
                distric = userComplaintFind.privorgdistrict;
            }
        } else {
            accused = userComplaintFind.sgovaccused;
            aadhar = userComplaintFind.sgovaadhar;
            designation = userComplaintFind.sgovdesignation;
            department = userComplaintFind.sgovdep;
            relation = userComplaintFind.sgovrel;
            icc = userComplaintFind.sgovicc;
            complaintbrief = userComplaintFind.sgovbrief;
            state = userComplaintFind.sgovstate;
            distric = userComplaintFind.sgovdistrict;

        }
    } else {
        accused = userComplaintFind.cgovaccused;
        aadhar = userComplaintFind.cgovaadhar;
        designation = userComplaintFind.cgovdesignation;
        department = userComplaintFind.cgovdep;
        relation = userComplaintFind.cgovrel;
        icc = userComplaintFind.cgovicc;
        complaintbrief = userComplaintFind.cgovbrief;
        state = userComplaintFind.cgovstate;
        distric = userComplaintFind.cgovdistrict;
    }

    res.render("userPage", {
        fullName: customuser.fullName,
        useremail: customuser.userEmail,
        favouritepet: customuser.favPet,
        // complaint details
        Accused: accused,
        Aadhar: aadhar,
        Designation: designation,
        Department: department,
        Relation: relation,
        ICC: icc,
        Complaintbrief: complaintbrief,
        State: state,
        District: distric
    })
})

// Secret page to enter the admin data
app.get("/secret-super-admin", (req, res) => {
    res.render("secret-super-admin", {
        passErrMessage: ""
    });
})

app.post("/secret-super-admin", async (req, res) => {
    const secretSAKey = md5(req.body.secretAddKey);
    const superAdminID = md5(req.body.adminKey);
    const existingSuperAdmin = await SuperAdminData.findOne({ uniqueAuthenticationID: superAdminID });
    if (existingSuperAdmin == null) {
        res.render("secret-super-admin", {
            passErrMessage: "You are not our any member"
        })
    } else {
        if (existingSuperAdmin.secretKey === secretSAKey) {
            res.render("add-admins", {
                addNewAgain: ""
            })
        } else {
            res.render("secret-super-admin", {
                passErrMessage: "Sorry, PASSWORD ENTERED IS WRONG"
            })
        }
    }
})



app.post("/admins-add", async (req, res) => {
    const checkNewAdmin = await AdminData.findOne({ adminEmail: req.body.adminemail });
    if (checkNewAdmin == null) {
        const newAdmin = new AdminData({
            adminFullName: req.body.adminfullname,
            adminEmail: req.body.adminemail,
            adminUniqueID: req.body.adminuniqueid,
            adminState: req.body.adminstate,
            adminDistrict: req.body.admindistrict,
            adminContact: req.body.admincontact,
            adminPassword: md5(req.body.adminpassword)
        })
        await newAdmin.save();
        res.render("add-admins", {
            addNewAgain: "Add more Admins"
        })
    } else {
        res.render("add-admins", {
            addNewAgain: "This Admin is already our member"
        })
    }
})

app.get("/adminLogin", async (req, res) => {
    res.render("adminLogin", {
        passErrMessage: ""
    })
})

app.post("/adminLogin", async (req, res) => {
    const checkExistingAdmin = await AdminData.findOne({ adminUniqueID: req.body.adminAuth });
    if (checkExistingAdmin == null) {
        res.render("adminLogin", {
            passErrMessage: "You are not the part of Admins Member"
        })
    } else {
        if (checkExistingAdmin.adminPassword === md5(req.body.adminpassword)) {
            const checkCgovComplaints = await CgovComplaint.find({ cgovdistrict: checkExistingAdmin.adminDistrict });
            const checkSgovComplaints = await SgovComplaint.find({ sgovdistrict: checkExistingAdmin.adminDistrict });
            const checkPrivComplaints = await PrivComplaint.find({ privorgdistrict: checkExistingAdmin.adminDistrict });
            res.render("adminPage", {
                adminName: checkExistingAdmin.adminFullName,
                adminEmail: checkExistingAdmin.adminEmail,
                adminUniqueID: checkExistingAdmin.adminUniqueID,
                adminState: checkExistingAdmin.adminState,
                adminDistrict: checkExistingAdmin.adminDistrict,
                districtCGOVComplaints: checkCgovComplaints,
                districtSGOVComplaints: checkSgovComplaints,
                districtPRIVComplaints: checkPrivComplaints
            })
        } else {
            res.render("adminLogin", {
                passErrMessage: "The password entered is wrong!!"
            })
        }
    }
})


app.get("/cgovcomplaint", (req, res) => {
    res.render("complaintPages/cgovcomplaint");
})


app.post("/cgovcomplaint", async (req, res) => {
    const newCGovComplaint = new CgovComplaint({
        cgovname: req.body.cgovname,
        cgovdesignation: req.body.cgovdesignation,
        cgovcontact: req.body.cgovcontact,
        cgovemail: req.body.cgovemail,
        cgovaadhar: req.body.cgovaadhar,
        cgovorganisation: req.body.cgovorganisation,
        cgovaccused: req.body.cgovaccused,
        cgovdep: req.body.cgovdep,
        cgovrel: req.body.cgovrel,
        cgovicc: req.body.cgovicc,
        cgovbrief: req.body.cgovbrief,
        cgovstate: req.body.cgovstate,
        cgovdistrict: req.body.cgovdistrict
    })
    await newCGovComplaint.save();


    res.render("complaintPages/successFailure", {
        titleSuccessFailure: "hurray",
        successFailureMessage: req.body.cgovname + " you have successfully Submitted your complaint"
    })

})

app.post("/sgovcomplaint", async (req, res) => {
    const newSGovComplaint = new SgovComplaint({
        sgovname: req.body.sgovname,
        sgovdesignation: req.body.sgovdesignation,
        sgovcontact: req.body.sgovcontact,
        sgovemail: req.body.sgovemail,
        sgovaadhar: req.body.sgovaadhar,
        sgovaccused: req.body.sgovaccused,
        sgovdep: req.body.sgovdep,
        sgovrel: req.body.sgovrel,
        sgovicc: req.body.sgovicc,
        sgovbrief: req.body.sgovbrief,
        sgovstate: req.body.sgovstate,
        sgovdistrict: req.body.sgovdistrict
    })
    await newSGovComplaint.save();
    res.render("complaintPages/successFailure", {
        titleSuccessFailure: "hurray",
        successFailureMessage: req.body.sgovname + " you have successfully Submitted your complaint"
    })
})

app.post("/privcomplaint", async (req, res) => {

    const newPrivComplaint = new PrivComplaint({
        privname: req.body.privname,
        privdesignation: req.body.privdesignation,
        privcontact: req.body.privcontact,
        privemail: req.body.privemail,
        privaadhar: req.body.privaadhar,
        privorgstate: req.body.privorgstate,
        privorgdistrict: req.body.privorgdistrict,
        privorgname: req.body.privorgname,
        privorgcontact: req.body.privorgcontact,
        privorgemail: req.body.privorgemail,
        privorghead: req.body.privorghead,
        privaccused: req.body.privaccused,
        privdep: req.body.privdep,
        privrel: req.body.privrel,
        privicc: req.body.privicc,
        privbrief: req.body.privbrief
    })
    await newPrivComplaint.save();
    res.render("complaintPages/successFailure", {
        titleSuccessFailure: "hurray",
        successFailureMessage: req.body.privname + " you have successfully Submitted your complaint"
    })
})


app.get("/sgovcomplaint", (req, res) => {
    res.render("complaintPages/sgovcomplaint");
})

app.get("/privcomplaint", (req, res) => {
    res.render("complaintPages/privcomplaint");
})

app.post("/usercomplaint/status", async (req, res) => {
    const newComplaintStatus = new ComplaintStatus({
        complaintstatus: req.body.selectstatus,
        complaintID: req.body.complaintId,
        employeeType: req.body.employee,
        complaintuserEmail: req.body.employeeEmail
    })
    const prevStatus = await ComplaintStatus.findOne({ complaintID: req.body.complaintId });
    if (prevStatus == null) {
        await newComplaintStatus.save();
    } else {
        await ComplaintStatus.updateOne({ complaintID: req.body.complaintId }, { $set: { complaintstatus: req.body.selectstatus } });
    }
    res.redirect("/adminLogin");
})




app.get("/stories", (req, res)=>{
    res.render("stories");
})


app.get("/resources", (req, res)=>{
    res.render("resources");
})


app.get("/contactus", (req, res) => {
    res.render("contactus");
})

app.get("/chatwithus", (req, res)=>{
    res.render("chatwithus");
})

app.get("/aboutus", (req, res) => {
    res.render("aboutus");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server started on port 3000");
});

// const newSuperAdmin = new SuperAdminData({
//     secretKey: md5("JH012345"),
//     uniqueAuthenticationID: md5("AF12N3K4N5"),
//     superAdminEmail: "luckykhateeb4@gmail.com",
//     superAdminContact: 9905522972
// })