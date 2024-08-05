import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import type { SendTemplatedEmailCommandInput } from "@aws-sdk/client-ses";

const sesConfig = {
    region: "us-east-2",
}

const client = new SESClient(sesConfig);

const sendVerificationInput: SendTemplatedEmailCommandInput = {
    Source: "Indoor Maps <accounts@indoormaps.theoh.dev>",
    Destination: {
        ToAddresses: [],
    },
    Template: "VerifyIndoorMapsEmail",
    TemplateData: "",
};

export const sendVerificationEmail = async (email: string, verificationToken: string, name: string) => {
    // Earily return if no existing aws key
    if(!process.env.AWS_ACCESS_KEY_ID) {
        console.log("failed to send a verification email due to lack of AWS credentials")
        return;
    };
    sendVerificationInput.TemplateData = JSON.stringify({
        name,
        frontendUrl: process.env.FRONTEND_URL,
        verificationToken,
    });
    // ! is ok here because it is referencing a predetermined constant
    sendVerificationInput.Destination!.ToAddresses = [email];
    const command = new SendTemplatedEmailCommand(sendVerificationInput);
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode !== 200) {
        console.error(response)
    }
}
