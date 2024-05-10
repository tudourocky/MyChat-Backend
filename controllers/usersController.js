const User = require("../model/userModel");
const brcypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
    try{
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({username});
        if (usernameCheck) {
            return res.status(false).json({message: "Username already exists"});
        }
        const emailCheck = await User.findOne({email});
        if (emailCheck) {
            return res.status(false).json({message: "Email already exists"});
        }
        const hashedPassword = await brcypt.hash(password, 10);
        const user = await User.create({username, email, password: hashedPassword});
        delete user.password;
        return res.json({ status: true, user});
    }catch(err){
        next(err);
    }
};

module.exports.login = async (req, res, next) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(false).json({message: "Incorrect username or password"});
        }
        const isPasswordCorrect = await brcypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(false).json({message: "Incorrect username or password"});
        }
        delete user.password;
        return res.json({ status: true, user});
    }catch(err){
        next(err);
    }
};

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet : true,
            avatarImage,
        });
        return res.json({isSet:userData.isAvatarImageSet, image:userData.avatarImage });
    }catch(err){
        next(err);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({_id: {$ne: req.params.id}}).select([
            "email", "username", "avatarImage", "_id",
        ]);
        return res.json(users);
    }catch(err){
        next(err);
    }
};