
"use client";
import { useState, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, Trash2, Download, Mail } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

const InvoicePreview = ({ invoiceRef, ...props }: any) => (
  <div ref={invoiceRef} className="p-8 bg-white text-black w-[210mm] min-h-[297mm]">
    <div className="flex justify-between items-start">
      <div>
        {props.logo ? (
          <img src={props.logo} alt="logo" className="h-20" />
        ) : (
          <div className="w-40 h-20 bg-muted flex items-center justify-center text-muted-foreground text-sm">
            + Add Your Logo
          </div>
        )}
        <Textarea className="mt-4 border-black" placeholder="Who is this from?" value={props.from} readOnly />
      </div>
      <div className="text-right">
        <h1 className="text-4xl font-bold">INVOICE</h1>
        <div className="flex items-center justify-end mt-2">
          <span className="mr-2">#</span>
          <Input className="w-24 text-right border-black" value={props.invoiceNumber} readOnly />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 mt-8">
      <div>
        <Label>Bill To</Label>
        <Textarea placeholder="Who is this to?" value={props.billTo} readOnly className="border-black"/>
      </div>
      <div>
        <Label>Ship To</Label>
        <Textarea placeholder="(optional)" value={props.shipTo} readOnly className="border-black"/>
      </div>
    </div>
    
    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
      <div className="space-y-1"> <Label>Date</Label> <Input value={props.date} readOnly className="border-black"/> </div>
      <div className="space-y-1"> <Label>Payment Terms</Label> <Input value={props.paymentTerms} readOnly className="border-black"/> </div>
      <div className="space-y-1"> <Label>Due Date</Label> <Input value={props.dueDate} readOnly className="border-black"/> </div>
      <div className="space-y-1"> <Label>PO Number</Label> <Input value={props.poNumber} readOnly className="border-black"/> </div>
    </div>

    <div className="mt-8">
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr] bg-gray-800 text-white p-2 rounded-t-md font-bold">
            <div>Item</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
        </div>
        <div>
            {props.lineItems.map((item: any, index: number) => (
            <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr] items-center p-2 border-b border-l border-r">
                <div>{item.description}</div>
                <div className="text-right">{item.quantity}</div>
                <div className="text-right">₹{item.rate.toFixed(2)}</div>
                <div className="text-right font-medium">₹{(item.quantity * item.rate).toFixed(2)}</div>
            </div>
            ))}
        </div>
    </div>
    
    <div className="flex justify-end mt-4">
        <div className="w-1/2 space-y-3 text-sm">
             <div className="flex justify-between"><span>Subtotal</span> <span>₹{props.subtotal.toFixed(2)}</span></div>
             <div className="flex justify-between items-center">
                 <span>Tax</span>
                 <div className="flex items-center gap-2">
                    <Input readOnly value={props.tax} className="w-16 text-right border-black"/>
                    <span>%</span>
                </div>
            </div>
             <div className="flex justify-between"><span>Discount</span> <span>-₹{props.discount.toFixed(2)}</span></div>
             <div className="flex justify-between"><span>Shipping</span> <span>+₹{props.shipping.toFixed(2)}</span></div>
             <Separator className="bg-black" />
             <div className="flex justify-between font-bold text-base"><span>Total</span> <span>₹{props.total.toFixed(2)}</span></div>
             <div className="flex justify-between items-center">
                 <span>Amount Paid</span>
                 <div className="flex items-center gap-2">
                    <span>₹</span>
                    <Input readOnly value={props.amountPaid} className="w-24 text-right border-black"/>
                </div>
            </div>
             <div className="flex justify-between font-bold text-base"><span>Balance Due</span> <span>₹{props.balanceDue.toFixed(2)}</span></div>
        </div>
    </div>

    <div className="mt-12 space-y-4 text-sm">
        <div>
            <Label>Notes</Label>
            <p className="text-xs text-gray-600">{props.notes || 'Any relevant information not already covered'}</p>
        </div>
        <div>
            <Label>Terms</Label>
            <p className="text-xs text-gray-600">{props.terms || 'Terms and conditions - late fees, payment methods, delivery schedule'}</p>
        </div>
    </div>
  </div>
);

export default function InvoiceGenerator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Item description...", quantity: 1, rate: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const [isPreview, setIsPreview] = useState(false);
  const invoiceRef = useRef(null);

  const subtotal = useMemo(
    () => lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0),
    [lineItems]
  );
  const total = useMemo(
    () => subtotal + (subtotal * tax) / 100 - discount + shipping,
    [subtotal, tax, discount, shipping]
  );
  const balanceDue = useMemo(() => total - amountPaid, [total, amountPaid]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }]);
  };
  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };
  const handleLineItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setLogo(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleDownload = () => {
    const input = invoiceRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceNumber}.pdf`);
      toast.success("Invoice downloaded!");
    });
  };

  const handleEmail = () => {
    toast.success("Invoice sent via email!");
  }


  if (isPreview) {
    return (
       <Dialog open={isPreview} onOpenChange={setIsPreview}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
             <div className="flex-grow overflow-auto bg-gray-100">
                <InvoicePreview {...{invoiceRef, logo, from, billTo, shipTo, invoiceNumber, date, paymentTerms, dueDate, poNumber, lineItems, notes, terms, subtotal, tax, discount, shipping, total, amountPaid, balanceDue}}/>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPreview(false)}>Back to Edit</Button>
                <Button onClick={handleDownload}><Download size={16}/> Download PDF</Button>
                <Button onClick={handleEmail}><Mail size={16}/> Email Invoice</Button>
            </DialogFooter>
        </DialogContent>
       </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader><DialogTitle>Invoice Generator</DialogTitle></DialogHeader>
        <div className="flex-grow overflow-auto p-2 pr-4 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                     <Label htmlFor="logo-upload" className="w-48 h-28 bg-muted flex items-center justify-center text-muted-foreground text-sm cursor-pointer rounded-md border-dashed border-2 hover:border-primary">
                        {logo ? <img src={logo} alt="logo" className="object-contain h-full w-full"/> : <span><Upload size={16} className="inline-block mr-1" /> Add Your Logo</span>}
                    </Label>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                    <Textarea placeholder="Who is this from?" className="mt-2" value={from} onChange={e => setFrom(e.target.value)}/>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold text-gray-700">INVOICE</h1>
                    <div className="flex items-center justify-end mt-2">
                        <span className="mr-2 text-muted-foreground">#</span>
                        <Input className="w-24 text-right" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                    </div>
                </div>
            </div>
            
            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-8">
                <div><Label>Bill To</Label><Textarea placeholder="Who is this to?" value={billTo} onChange={e => setBillTo(e.target.value)}/></div>
                <div><Label>Ship To</Label><Textarea placeholder="(optional)" value={shipTo} onChange={e => setShipTo(e.target.value)}/></div>
            </div>

            {/* Dates & PO */}
            <div className="grid grid-cols-4 gap-4 text-sm">
                <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)}/></div>
                <div><Label>Payment Terms</Label><Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} /></div>
                <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/></div>
                <div><Label>PO Number</Label><Input value={poNumber} onChange={e => setPoNumber(e.target.value)}/></div>
            </div>

            <Separator />
            
            {/* Line Items */}
            <div>
                 <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-2 p-2 font-bold text-sm text-muted-foreground">
                    <div>Item</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Rate</div>
                    <div className="text-right">Amount</div>
                    <div></div>
                </div>
                 <div className="space-y-2">
                    {lineItems.map(item => (
                        <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-2 items-center">
                            <Input placeholder="Description of item/service..." value={item.description} onChange={e => handleLineItemChange(item.id, 'description', e.target.value)} />
                            <Input type="number" className="text-right" value={item.quantity} onChange={e => handleLineItemChange(item.id, 'quantity', Number(e.target.value))} />
                            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span><Input type="number" className="text-right pr-4 pl-6" value={item.rate} onChange={e => handleLineItemChange(item.id, 'rate', Number(e.target.value))} /></div>
                            <div className="text-right font-medium pr-2">₹{(item.quantity * item.rate).toFixed(2)}</div>
                            <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}><Trash2 size={16} className="text-red-500"/></Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" onClick={addLineItem} className="mt-2">+ Line Item</Button>
            </div>

            <Separator />
            
            {/* Totals Section */}
            <div className="flex justify-between">
                <div className="w-1/2 space-y-4">
                     <div><Label>Notes</Label><Textarea placeholder="Any relevant information not already covered" value={notes} onChange={e => setNotes(e.target.value)} /></div>
                     <div><Label>Terms</Label><Textarea placeholder="Terms and conditions..." value={terms} onChange={e => setTerms(e.target.value)}/></div>
                </div>
                <div className="w-1/3 space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span>Subtotal</span> <span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span>Tax (%)</span> <Input type="number" className="w-20 text-right" value={tax} onChange={e => setTax(Number(e.target.value))} /></div>
                    <div className="flex justify-between items-center"><span>Discount (₹)</span> <Input type="number" className="w-20 text-right" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></div>
                    <div className="flex justify-between items-center"><span>Shipping (₹)</span> <Input type="number" className="w-20 text-right" value={shipping} onChange={e => setShipping(Number(e.target.value))} /></div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-base"><span>Total</span> <span>₹{total.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span>Amount Paid (₹)</span> <Input type="number" className="w-24 text-right" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} /></div>
                    <div className="flex justify-between items-center font-bold text-base"><span>Balance Due</span> <span>₹{balanceDue.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button onClick={() => setIsPreview(true)}>Generate & Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
