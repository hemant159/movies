// import Bus from "../models/Bus.js";
// import { assignRouteToBus, calculateNextStop, getRoutePolyline } from "./routingService.js";

// const automaticRoutingJob = async () => {
//   try {
//     const buses = await Bus.find({ is_manual: false }); // Exclude manually overridden buses

//     for (const bus of buses) {
//       await assignRouteToBus(bus);
//       await calculateNextStop(bus);
//       bus.directions = await getRoutePolyline(bus);
//       await bus.save();
//     }
//   } catch (error) {
//     console.error("Error during automatic routing:", error);
//   }
// };

// export default automaticRoutingJob;
