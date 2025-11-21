import { Card, CardContent } from "../../components/ui/card";
import { Button } from "@/components/ui/button";
import { Integrations } from "./integrations";
import { AIChatDemo } from "./ai-chat-demo";
import { FieldCardsDemo } from "./field-cards-demo";
import { Link } from "@tanstack/react-router";

export const Hero = () => {
  // Feature cards data
  const features = [
    {
      title: "Lightning-Fast Interface",
      description:
        "Navigate the entire app using just your keyboard and never feel a disconnect between thoughts and actions",
      image: (
        <div className="scale-70">
          {" "}
          <FieldCardsDemo />{" "}
        </div>
      ),
    },
    {
      title: "AI Powered",
      description:
        "Use AI supercharge tedious and manual workflows. Let AI help you iterate give insights based on your data and more.",
      image: (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:h-96">
          <div className="absolute left-0 top-0 aspect-square w-full rounded-2xl  md:h-96 md:w-96" />
          <div className="">
            <AIChatDemo />
          </div>
        </div>
      ),
    },
    {
      title: "Sync Your Data",
      description:
        "Integrate your data and use with whatever services and platforms you are most comfortable",
      image: <Integrations />,
    },
  ];

  const bgImage =
    "https://moltmqa28u.ufs.sh/f/0q2U2s5hTRxUi1ce8Z3PErVbulUkWN8Jm7nF0zeMwKgcCSyY";

  return (
    <main className="bg-[#050706] w-full min-h-screen">
      {/* Hero section with full-width background */}
      <section className="relative w-full">
        {/* Background image - full width */}
        <img
          className="w-full h-[732px] object-cover"
          alt="Background"
          src={bgImage}
        />

        {/* Hero content - centered within max-width */}
        <div className="absolute inset-0 flex flex-row justify-center">
          <div className="w-full max-w-[1440px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="font-['Plus_Jakarta_Sans',Helvetica] text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              Beyond Forms
              <br />
              Surveys that think with you.
            </h1>

            <p className="mt-8 max-w-[604px] font-['Plus_Jakarta_Sans',Helvetica] text-[#878787] text-base sm:text-lg md:text-xl lg:text-2xl">
              Informal is an AI-native survey builder that helps you create
              surveys faster and smarter.
            </p>

            <div className="flex gap-5 mt-10">
              <Button
                className="h-10 w-[158px] bg-[#8c5cff] rounded-[31px] border border-solid border-black text-white hover:bg-[#7a4de0]"
                asChild
              >
                <Link to="/sign-in/$">Get Started</Link>
              </Button>

              <Button
                variant="outline"
                className="h-10 w-[158px] rounded-[31px] border border-solid border-white text-white hover:bg-[#19191c]"
                asChild
              >
                <Link to="/">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section - centered within max-width */}
      <div className="flex flex-row justify-center w-full">
        <div className="w-full max-w-[1440px] relative">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 mt-[-100px] mb-16 relative z-10">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <Card className="bg-[#19191c] rounded-[15px] border-[0.5px] border-solid border-[#535353] h-[261px] overflow-hidden relative">
                  <CardContent className="p-0 h-full flex items-center justify-center">
                    {feature.image}
                  </CardContent>
                </Card>

                <h3 className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-white text-base sm:text-lg md:text-xl mt-4">
                  {feature.title}
                </h3>

                <p className="font-['Plus_Jakarta_Sans',Helvetica] font-normal text-[#7d7b7b] text-xs sm:text-sm md:text-base mt-2">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
};
