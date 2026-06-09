import Employee from "../../models/employee/Employee.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
};

export { JWT_SECRET, COOKIE_OPTIONS };

export async function buildAuthUser(user) {
  const plain = user.get({ plain: true });
  delete plain.password;

  const employee = await Employee.findOne({
    where: { userId: user.id },
    attributes: ["id", "fullName", "nip"],
  });

  return {
    ...plain,
    employeeId: employee?.id ?? null,
    displayName: plain.name || employee?.fullName || plain.username,
  };
}
