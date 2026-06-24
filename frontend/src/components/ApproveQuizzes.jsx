import { useEffect, useState } from "react";
import axios from "axios";

const ApproveQuizzes = () => {

    const [quizzes,setQuizzes]=useState([]);

    const loadQuizzes=()=>{

        axios.get(

            "http://localhost:5000/api/quizzes/pending",

            {

                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }

            }

        ).then(res=>setQuizzes(res.data));

    }

    useEffect(()=>{

        loadQuizzes();

    },[]);

    const approve=async(id)=>{

        await axios.put(

            `http://localhost:5000/api/quizzes/${id}/approve`,

            {},

            {

                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }

            }

        );

        loadQuizzes();

    }

    return(

        <div>

            <h2>Pending Quizzes</h2>

            {

                quizzes.map(quiz=>(

                    <div
                        key={quiz._id}
                        style={{
                            border:"1px solid #ddd",
                            marginBottom:20,
                            padding:15
                        }}
                    >

                        <h3>{quiz.title}</h3>

                        <p>{quiz.description}</p>

                        <p>Teacher : {quiz.teacher.username}</p>

                        <button onClick={()=>approve(quiz._id)}>

                            Approve

                        </button>

                    </div>

                ))

            }

        </div>

    )

}

export default ApproveQuizzes;