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
  const isEuEntity = watch(`${prefix}isEuEntity`);

  const handleTypeChange = (value: string) => {
    if (value === "individual") {
      // Persoană Fizică
      control._formValues[`${prefix}isCompany`] = false;
      control._formValues[`${prefix}isEuEntity`] = false;
    } else if (value === "company") {
      // Companie Românească
      control._formValues[`${prefix}isCompany`] = true;
      control._formValues[`${prefix}isEuEntity`] = false;
    } else if (value === "eu_entity") {
      // Entitate UE
      control._formValues[`${prefix}isCompany`] = false;
      control._formValues[`${prefix}isEuEntity`] = true;
    }
    // Trigger re-render
    control._formValues = { ...control._formValues };
  };

  const getCurrentType = () => {
    if (isEuEntity) return "eu_entity";
    if (isCompany) return "company";
    return "individual";
  };

  return (
    <>
      {/* Tip Beneficiar */}
      <FormField
        control={control}
        name={`${prefix}isCompany`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tip Beneficiar</FormLabel>
            <Select value={getCurrentType()} onValueChange={handleTypeChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="individual">Persoană Fizică</SelectItem>
                <SelectItem value="company">Companie Românească</SelectItem>
                <SelectItem value="eu_entity">Entitate UE</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hidden field for isEuEntity */}
      <FormField
        control={control}
        name={`${prefix}isEuEntity`}
        render={({ field }) => (
          <input type="hidden" {...field} value={isEuEntity ? "true" : "false"} />
        )}
      />

      {isEuEntity ? (
        <>
          {/* EU Entity Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume Entitate UE *</FormLabel>
                  <FormControl>
                    <Input placeholder="Numele entității UE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${prefix}euCountryCode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Țara UE *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează țara" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DE">Germania (DE)</SelectItem>
                      <SelectItem value="FR">Franța (FR)</SelectItem>
                      <SelectItem value="IT">Italia (IT)</SelectItem>
                      <SelectItem value="ES">Spania (ES)</SelectItem>
                      <SelectItem value="NL">Olanda (NL)</SelectItem>
                      <SelectItem value="BE">Belgia (BE)</SelectItem>
                      <SelectItem value="AT">Austria (AT)</SelectItem>
                      <SelectItem value="SE">Suedia (SE)</SelectItem>
                      <SelectItem value="DK">Danemarca (DK)</SelectItem>
                      <SelectItem value="FI">Finlanda (FI)</SelectItem>
                      <SelectItem value="PL">Polonia (PL)</SelectItem>
                      <SelectItem value="CZ">Cehia (CZ)</SelectItem>
                      <SelectItem value="HU">Ungaria (HU)</SelectItem>
                      <SelectItem value="SK">Slovacia (SK)</SelectItem>
                      <SelectItem value="SI">Slovenia (SI)</SelectItem>
                      <SelectItem value="HR">Croația (HR)</SelectItem>
                      <SelectItem value="BG">Bulgaria (BG)</SelectItem>
                      <SelectItem value="EE">Estonia (EE)</SelectItem>
                      <SelectItem value="LV">Letonia (LV)</SelectItem>
                      <SelectItem value="LT">Lituania (LT)</SelectItem>
                      <SelectItem value="LU">Luxemburg (LU)</SelectItem>
                      <SelectItem value="MT">Malta (MT)</SelectItem>
                      <SelectItem value="CY">Cipru (CY)</SelectItem>
                      <SelectItem value="IE">Irlanda (IE)</SelectItem>
                      <SelectItem value="PT">Portugalia (PT)</SelectItem>
                      <SelectItem value="GR">Grecia (GR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`${prefix}euVatNumber`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Număr TVA UE *</FormLabel>
                <FormControl>
                  <Input placeholder="ex: DE123456789, FR12345678901" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${prefix}euTaxId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Fiscal UE</FormLabel>
                <FormControl>
                  <Input placeholder="ID fiscal pentru raportare" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${prefix}address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresa Completă *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Adresa completă a entității UE" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@entitate-ue.com" {...field} />
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
                    <Input placeholder="+49 30 12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`${prefix}companyLegalRepresentative`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reprezentant Legal</FormLabel>
                <FormControl>
                  <Input placeholder="Numele reprezentantului legal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : isCompany ? (
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
              name={`${prefix}companyLegalRepresentative`}
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
                    <Input placeholder="Numele complet al beneficiarului" {...field} />
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