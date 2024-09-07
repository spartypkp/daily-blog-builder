# Will's Quest to Build a "Blog Builder" 🛠️

Welcome back to another episode of "What Will Will Build Today?" I'm your host and the much-needed interpreter of Will's coding adventures, Dave. Today, our beloved aspiring AI engineer Will is diving headfirst into constructing his most meta project yet – a "Blog Builder" for his daily progress blogs. Let's see how he fared, shall we?

### 🎯 Task Goal
Today, Will decided to build his own world - a "Blog Builder" tool specifically designed for creating, editing, and posting blogs on his website. But this isn't just any tool; it's a mirror reflecting the blogosphere itself! Will ambitiously noted:
> "Develop a MVP build for my 'Blog Builder' tool, which will serve as a tool for creating daily progress blogs, editing with AI help, and then posting to my website."

### ✍️ Task Description
In typical Will fashion, he started with a cloud of ideas rather than a detailed plan. Will described his initial chaos with charming candor:
>"The first part of building my 'Blog Builder' is deciding what I want to build! I only have some loose requirements for the tool, and I'm really unsure of what the final tool will look like."

Ah, the sweet smell of software development in the morning - smells like...indecision. 

### 🧐 Expected Difficulty
Will rated this task a solid 25 out of...well, we're not sure what the max is, but let's just say it's comfortably challenging.

### 📑 Planned Approach
Our hero Will outlined his battle plan in meticulous, bullet-point detail:
1. **Requirements Listing**: Brainstorm what his beloved Blog Builder should encompass – from basic aesthetics to grand plans of AI integration.
2. **Tech Recon**: Delving into the depths of ChatGPT discussions to decide on the technologies – Flask for the backend and sticking with the good ol' PostgreSQL. Because who doesn't love a bit of SQL with their morning coffee?
3. **Tech Stack Decision**: Based on intense Googling and soul-searching.
4. **Frontend Feats**: Crafting a simple yet functional HTML page that talks to the backend and dances with databases.

### 📝 Task Progress Notes
Oh, what a day it was! Will started by envisioning what this tool could be, aided by his trusty sidekick, ChatGPT. As Will puts it:
> "My day started out by thinking about a list of requirements for the blog builder. I jumped right into research with ChatGPT, my favorite partner programming rubber ducky."

Through scholarly discussions with an AI, Will decided Flask would be his chariot to victory. He muses:
> "After discussing with ChatGPT, it became clear that Flask would probably be the best choice. It would allow me the most flexibility and speed to MVP."

Will also bravely ventured into the land of code, sharing a snippet of his "pydantic_select" function, a testament to his undying love for Pydantic and less safe SQL practices:
```python
def pydantic_select(sql_select: str, modelType: Type[BaseModel]) -> List[Any]:
    """
    Executes a SQL SELECT statement and returns the result rows as a list of Pydantic models.
    Args:
        sql_select (str): The SQL SELECT statement to execute.
        modelType (Optional[Any]): The Pydantic model to use for the row factory
    Returns:
        List[Any]: The rows returned by the SELECT statement as a list of Pydantic Models.
    """   
    # Use the provided modelType (PydanticModel) for the row factory
    if modelType:
        conn = db_connect(row_factory=class_row(modelType))
    
    cur = conn.cursor()
    # Execute the SELECT statement
    cur.execute(sql_select)
    
    # Fetch all rows
    rows = cur.fetchall()
    
    # Close the cursor and the connection
    cur.close()
    conn.close()

    return rows
```
Will confessed:
> "It is considered bad practice to use Python f string formatting to inject the table name directly, however I don't care. I will always be manually specifying the table name, which is never derived from user input."

In his quest, Will designed the data schema, decided on storing daily blogs in a `daily_blogs` table with SQL's JSONB data type because, let's face it, flexibility is the spice of life. His Pydantic models were set to precisely mirror his SQL columns, a harmony that only the best of backend developers could dream of. Here's a glimpse at his SQL creation masterclass:
```sql
CREATE TABLE daily_blogs (
    date date PRIMARY KEY,
    introduction jsonb,
    tasks jsonb,
    reflection jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
### 🕵️‍♂️ Challenges Encountered
Our dear Will faced the usual developers' buffet of bugs and head-scratchers. From the infamous 'pip install' typo to wrestling with Flask and CSS (his eternal nemesis), it was a rollercoaster. Not to mention his intimate battle with Quill's image resizing. Will grumbled about CSS:
> "CSS. I hate CSS. It's ALWAYS a challenge for me to create something that looks good."

### 🔍 Research Questions
Among the day's ponderings were enigmas such as:
- "What's the meaning of life?"
- "How can I automatically resize images in a Quill text element?"
- Deep dives into Jinja2 syntax for perfectly templating his life away.

### 🛠️ Tools Used
Will wielded a diverse toolkit that included Flask, Python, the beloved Pydantic, PostgreSQL, and, of course, his brain - an underappreciated gem.

### 🥳 Reflection Successes
Will marvels at his productivity, managing to set up a Flask app faster than making instant noodles. His integration of database and frontend HTML was almost poetic.
>"My design and research process went very well, considering I had a pretty narrow preset idea on what an ideal approach might be."

### 😤 Reflection Failures
Despite the triumphs, Will admits to getting sucked into the CSS swamp and some lazy scripting. Not all heroes wear capes; some just get tangled in CSS.
>"CSS styling. I hate it. It always is a tarpit."

### 🎁 Output or Result
Behold! A local Flask masterpiece capable of crafting daily blogs:
> "One local Flask application, which provides a 'Daily Blog Builder'. Goal achieved! Excellent!"

### ⏱️ Time Spent
Coding: 8 hours, Researching: 4 hours, Debugging: 3 hours. A day well spent.

### 🗓️ Follow-Up Tasks
> "Finish writing this damn blog! And publish it on my website! Really, I'm ready to move on."

And so, Will's saga continues. Stay tuned for more coding capers and technological triumphs (or tribulations). See you next time on "What Will Will Build Today?" Wrapping up, it's Dave, reminding you that behind every great blog is an even greater flurry of frantic coding and existential debugging. Cheers! 🍻