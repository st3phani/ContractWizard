import { Control, UseFormWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface BeneficiaryFormFieldsProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  namePrefix?: string; // e.g., "beneficiary" for nested forms
}

export function BeneficiaryFormFields({ control, watch, namePrefix = "" }: BeneficiaryFormFieldsProps) {
  const prefix = namePrefix ? `${namePrefix}.` : "";
  const isCompany = watch(`${prefix}isCompany`);

  return (
    <>
      {/* Tip Partener */}
      <FormField
        control={control}
        name={`${prefix}isCompany`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Partner Type</FormLabel>
            <Select onValueChange={(value) => field.onChange(value === "true")}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="false">Individual</SelectItem>
                <SelectItem value="true">Company</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />


      {isCompany ? (
        <>
          {/* Company Fields */}
          <FormField
            control={control}
            name={`${prefix}companyName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${prefix}companyAddress`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Address *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Complete company address" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}companyCui`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CUI *</FormLabel>
                  <FormControl>
                    <Input placeholder="RO12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${prefix}companyRegistrationNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration No. *</FormLabel>
                  <FormControl>
                    <Input placeholder="J40/1234/2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Representative *</FormLabel>
                  <FormControl>
                    <Input placeholder="Legal representative name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${prefix}cnp`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Representative CNP *</FormLabel>
                  <FormControl>
                    <Input placeholder="Legal representative CNP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      ) : (
        <>
          {/* Individual Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Partner's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${prefix}cnp`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNP *</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`${prefix}address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Complete address" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Common fields for both */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@address.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input placeholder="+40 xxx xxx xxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}