const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL;
const SHEET_Id = import.meta.env.VITE_SHEET_ID;

export const authenticateUser = async (username, password) => {
  try {
    const response = await fetch(
      `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=Repair%20Login&_=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json();

    // Transform the table data into a usable format
    if (data.success && data.table && data.table.rows) {
      const users = data.table.rows.map((row) => {
        const cells = row.c || []; // Handle cases where c might be undefined

        // The structure seems to be:
        // 0: username
        // 1: password
        // 2: role
        // 3: page access
        return {
          username: (cells[0]?.v ?? "").toString().trim(), // user Name column
          password: (cells[1]?.v ?? "").toString().trim(), // Password column
          role: (cells[2]?.v ?? "").toString().trim(), // Role column
          access: (cells[3]?.v ?? "").toString().trim(), // Page Access column
          firmName: (cells[4]?.v ?? "").toString().trim(), // Firm Name column
        };
      });

      // Find the user that matches credentials (trim input to avoid stray whitespace mismatches)
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();
      const authenticatedUser = users.find(
        (user) =>
          user.username.toLowerCase() === trimmedUsername.toLowerCase() &&
          user.password === trimmedPassword
      );

      console.log("All users data:", users); // Debug: log all users data
      console.log("Authenticated user:", authenticatedUser); // Debug: log found user

      if (!authenticatedUser) {
        throw new Error("Invalid credentials");
      }

      // Handle empty access by providing default access based on role
      // const accessList = authenticatedUser.access ?
      //   authenticatedUser.access.split(',').map(item => item.trim()) :
      //   (authenticatedUser.role === 'admin' ?
      //     ['Dashboard', 'Assign Task', 'Tasks', 'Reports', 'Machines'] :
      //     ['Dashboard']);

      const accessList = authenticatedUser.access.split(",").map(item => item.trim());

      return {
        id: authenticatedUser.username,
        name: authenticatedUser.username,
        role: authenticatedUser.role,
        access: accessList,
        firmName: authenticatedUser.firmName,
      };
    }

    throw new Error("Invalid data format from server");
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};
