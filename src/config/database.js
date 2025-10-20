const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000, //fail after 30s
      socketTimeoutMS: 45000, // close sockets after 45s inactivity
      maxPoolSize: 10, //increase depending on users
    });
    console.log(`🗄️ MongoDB is connected to ${process.env.MONGO_URL}`);

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB has successfully reconnected!");
    });

    return connection;
  } catch (error) {
    console.error(`❌ Error in connecting to ${process.env.MONGO_URL}`, error);
  }
};

module.exports = connectDatabase;

//Monitor this later
// setInterval(() => {
//     console.log("🔹 Active connections:", mongoose.connections[0].readyState);
//     console.log("🔹 Pool size:", mongoose.connections[0].client.topology.s.sessionPool.sessions.size);
// }, 5000);
