import twilio from "twilio";
import { publicProcedure, router } from "../trpc";

/* export */ const testRouter = router({
  twilioTest: publicProcedure.mutation(async () => {
    // TODO: Implement twilio test
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    const service = await twilioClient.verify.v2.services.create({
      friendlyName: "CCRU Development",
    });

    const verification = await twilioClient.verify.v2
      .services(service.sid)
      .verifications.create({
        channel: "sms",
        to: "",
        // to: "+18596301297",
        // customCode: "032768",
      });

    return verification;
  }),
});
