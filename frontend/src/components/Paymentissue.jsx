import React from "react";

const PaymentIssueBanner = () => {
  const whatsappNumber = "919817975978";

  const message = encodeURIComponent(
    "Hello GemRishi, I am facing an issue while making payment. Please help me with my order."
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="relative flex h-[42px] items-center overflow-hidden">
        <div className="payment-marquee flex min-w-max items-center whitespace-nowrap">
          <p className="mx-8 text-xs sm:text-sm">
            We are currently facing some issues with our payment gateway.
            If you are unable to complete your payment, please contact us on{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              WhatsApp
            </a>
            .
          </p>

          {/* Duplicate for seamless scrolling */}
          <p className="mx-8 text-xs sm:text-sm">
            We are currently facing some issues with our payment gateway.
            If you are unable to complete your payment, please contact us on{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </div>

      <style>{`
        .payment-marquee {
          animation: payment-scroll 20s linear infinite;
        }

        @keyframes payment-scroll {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .payment-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default PaymentIssueBanner;
