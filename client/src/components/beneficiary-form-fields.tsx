import { Control, UseFormWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ParteneryFormFieldsProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  namePrefix?: string; // e.g., "partenery" for nested forms
}

export function ParteneryFormFields({ control, watch, namePrefix = "" }: ParteneryFormFieldsProps) {
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
            <FormLabel>Tip Partener</FormLabel>
            <Select onValueChange={(value) => field.onChange(value === "true")}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="false">Persoană Fizică</SelectItem>
                <SelectItem value="true">Companie</SelectItem>
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
                <FormLabel>Nume Companie *</FormLabel>
                <FormControl>
                  <Input placeholder="Numele companiei" {...field} />
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
                <FormLabel>Adresa Companiei *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adresa completă a companiei" rows={3} {...field} />
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
                  <FormLabel>Nr. Înregistrare *</FormLabel>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reprezentant Legal *</FormLabel>
                  <FormControl>
                    <Input placeholder="Numele reprezentantului legal" {...field} />
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
                  <FormLabel>CNP Reprezentant *</FormLabel>
                  <FormControl>
                    <Input placeholder="CNP reprezentant legal" {...field} />
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
                  <FormLabel>Nume Complet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Numele complet al partenerului" {...field} />
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
                <FormLabel>Adresa *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adresa completă" rows={3} {...field} />
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
                <Input type="email" placeholder="adresa@email.com" {...field} />
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
              <FormLabel>Telefon *</FormLabel>
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