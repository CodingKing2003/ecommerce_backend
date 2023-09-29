const express = require("express");
const {
  registerUser,
  loginUSer,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");
const { isAuthenticatedUser,authoriseRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUSer);
router.route("/logout").get(logout);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route('/password/update').put(isAuthenticatedUser,updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authoriseRoles("admin"), getAllUser);

  router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authoriseRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser,authoriseRoles("admin"),updateUserRole)
  .delete(isAuthenticatedUser,authoriseRoles("admin"),deleteUser)

module.exports = router;
