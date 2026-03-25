import pool from "../../config/db.mjs";
import bcrypt from "bcrypt"



const resetPassword = async (req, res )=>{
   const {token,mdp,confirmMdp}= req.body

//    l'objet pour le stokage des erreurs
   const errorObject ={}
//    expression reguliere pour plus de securite sur le mot de passe 
    const passwordRegexp = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    // validation du token 

    if(!token || token.trim()===""){
   return res.status(400).json({
    message:"token manquant ou invalide"
   })
    }

    // validation du nouveau mot de passe de l'utilisateur 


    if(!mdp||mdp.trim()===""){
        errorObject.mdp="le nouveau mot de passe est requis"
    }else if(mdp.length < 8){
     errorObject.mdp = "le mot de passe doit contenir au mois 8 caracteres";

    }else if(!passwordRegexp.test(mdp.trim())){
             errorObject.mdp = "au moins une majuscule, une minuscule, un chiffre et un caractère spécial";
    }
    // validation de confirmation du mot de passe 
    if(!confirmMdp||confirmMdp.trim()===""){
        errorObject.confirmMdp="la confirmation du mot de passe est requis"
    }else if(mdp!==confirmMdp){
        errorObject.confirmMdp="les deux mot de passe ne corespondent pas"
    }

// si le message d'erreur existe
    if(Object.keys(errorObject).length>0){
        return res.status(400).json({
      message: "Veuillez corriger les erreurs",
      errorObject:errorObject
        })
    }


    try {
        // verifier si le token existe ou pas 
        const userQuery  = await pool.query("SELECT id ,email ,reset_token_expiry FROM public.register WHERE reset_token =$1",[token])


        if(userQuery.rows.length==0){
            return res.status(400).json({
               message:"token invalide ou espirer  svp veuillez refais une demande" 
            })
        }

        const user = userQuery.rows[0]

        // verifier si le token n'est pas expirer

        if(new Date()>new Date(user.reset_token_expiry)){
            res.status(400).json({
                message:"ce lien  a expirer veuillez refais une demande de  réinitialisation"
            })


            // hasher le nouveau mot de passe de  user
            const salt = await bcrypt.genSalt(12)
             const hashedPassword  = await bcrypt.hash(salt,mdp)

            //  mettre a jour le nouveau mot de passe et supprimer le token

            await pool.query("UPDATE public.register SET mdp = $1,reset_token = NULL, reset_token_expiry = NULL WHERE id =$2",
            [hashedPassword,user.id]
            )

            return res.status(200).json({
                message:"Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter. "
            })
        }
    } catch (error) {
          console.error("erreur serveur",error)
          res.status(400).json({
                  message: "Erreur lors de la réinitialisation du mot de passe.",
          })
    }

}


export default resetPassword