import redis from "redis"

const client = redis.createClient();

client.on("error", (err) => {
    console.log("Error " + err);
});

//We should not *really* expose the underlying type of storage here.. but hey! here we go
export default client;