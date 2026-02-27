import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

export async function Identify(req :Request,res :Response){
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({
      message: "Either email or phoneNumber is required",
    });
  }

  try {

    const filters:string[] = []
    if (email) filters.push(`email.eq.${email}`)
    if (phoneNumber) filters.push(`phoneNumber.eq.${phoneNumber}`)

    const {data,error} = await supabase .from("Contact")
                                      .select("*")
                                      .or(filters.join(","))
                                      .order('created_at', { ascending: true })

    if(error){
      return res.status(500).json({ error: error.message });
    } 
                                  

    // CASE 1 - No Existing Contact

    
    if(!data || data.length == 0){
      const { data: inserted, error: insertedError } = await supabase
        .from("Contact")
        .insert({
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          linkPrecedence: "primary",
          linkedId: null,
        })
        .select("*")
        .single();

      if (insertedError || !inserted) {
        return res.status(500).json({
          error: insertedError?.message || "Insert failed",
        });
      }

      const contact = {
        primaryContatctId: inserted.id,
        emails: inserted.email ? [inserted.email] : [],
        phoneNumbers: inserted.phoneNumber ? [inserted.phoneNumber] : [],
        secondaryContactIds: [] as number[],
      };

      return res.status(200).json({
        contact: contact,
      });
    }


    // CASE 2 and 3


    if (data.length > 0){
      let matchedEmailData
      let matchedphoneNumber 
      for (const item of data){
        if(item.email === email && item.phoneNumber ===phoneNumber){ //if both email and phoneNumber found in same row
          const sendData = {
            primaryContatctId :item.id,
            emails: item.email ? [item.email] : [],
            phoneNumbers: item.phoneNumber ? [item.phoneNumber] : [],
            secondaryContactIds: item.linkedId ? [item.linkedId]: [] 
          }
          return res.status(200).json({message : "email with this Phone Number already exists",contact : sendData})
        }

        if(item.email === email){ // partial matching of email
           matchedEmailData = item 
        }

        if(item.phoneNumber === phoneNumber){ // partial matching of phoneNumber
           matchedphoneNumber = item
        }
        
        if(matchedEmailData && matchedphoneNumber){ // if both email and phone Number are matched in different rows 
          let oldest
          let newest

          if(new Date (matchedEmailData.created_at) < new Date (matchedphoneNumber.created_at)){  // finding which is the oldest 
            oldest = matchedEmailData
            newest = matchedphoneNumber
          }else{
            oldest = matchedphoneNumber
            newest = matchedEmailData
          }

          const {data : updateItem} = await supabase .from("Contact")
                                            .update({
                                              linkedId : oldest.id,
                                              linkPrecedence : "Secondary"
                                            })
                                            .eq(
                                              "id" , newest.id
                                            )
                                            .select("*")
                                            .single()

          const sendData = {
            primaryContatctId :updateItem.linkedId,
            emails: updateItem.email ? [oldest.email,updateItem.email,] : [],
            phoneNumbers: updateItem.phoneNumber ? [oldest.phoneNumber,updateItem.phoneNumber,] : [],
            secondaryContactIds: updateItem.id ? [updateItem.id]: []
          }      
          
          return res.status(200).json({message : "Done Successfully", contact : sendData})
        }
      }
    }


    // CASE 4
    if(data[0].phoneNumber === phoneNumber){
      const { data: createData , error : createError} = await supabase.from("Contact").insert({
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkPrecedence: "Secondary",
        linkedId: data[0].id,
      })
      .select("*")
      .single()

        if (createError || !createData) {
        return res.status(500).json({
          error: createError?.message || "Insert failed",
        });
      }

      const contact = {
        primaryContatctId: createData.linkedId,
        emails: createData.email ? [data[0].email,createData.email] : [],
        phoneNumbers: createData.phoneNumber ? [createData.phoneNumber] : [],
        secondaryContactIds: createData.id ? [createData.id]: []
      };

      return res.status(200).json({message : "Created Successfully",
        contact : contact
      })



    }

    // CASE 5
    if(data[0].email === email){

      const { data: createData , error : createError} = await supabase.from("Contact").insert({
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkPrecedence: "Secondary",
        linkedId: data[0].id,
      })
      .select("*")
      .single()

        if (createError || !createData) {
        return res.status(500).json({
          error: createError?.message || "Insert failed",
        });
      }

      const contact = {
        primaryContatctId: createData.linkedId,
        emails: createData.email ? [createData.email] : [],
        phoneNumbers: createData.phoneNumber ? [data[0].phoneNumber,createData.phoneNumber] : [],
        secondaryContactIds: createData.id ? [createData.id]: []
      };

      return res.status(200).json({message : "Created Successfully",
        contact : contact
      })
    }

                                           
  } catch (error : any) {
    return res.status(500).json({ error: error.message });
  }

}