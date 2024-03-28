import userModel from "../../models/userModel";

export const findOrCreateUserByGoogleId = async (profile: any) => {
  console.log(profile, "profile");

  try {
    let user = await userModel.findOne({ googleId: profile.id });
    if (!user) {
      user = await userModel.create({
        googleId: profile.id,
        email: profile.emails ? profile.emails[0].value : undefined,
        name: profile.displayName,
        image: profile.photos ? profile.photos[0].value : undefined,
        provider: "google",
      });
    }
    return user;
  } catch (err) {
    throw err;
  }
};

export const findOrCreateUserByFacebookId = async (profile: any) => {
  try {
    let user = await userModel.findOne({ facebookId: profile.id });
    if (!user) {
      user = await userModel.create({
        facebookId: profile.id,
        email: profile.emails ? profile.emails[0].value : undefined,
        name: profile.displayName,
      });
    }
    return user;
  } catch (err) {
    throw err;
  }
};
export const findUserByEmail = async (email: string) => {
  try {
    let user = await userModel.findOne({ email: email });
    return user;
  } catch (err) {
    throw err;
  }
};
